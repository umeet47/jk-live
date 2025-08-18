import { APIError } from "encore.dev/api";
import { WorkerManager } from "../repositories/worker.service";
import log from "encore.dev/log";
import Room from "../services/room.service";
import { cpus } from "os";
import mediasoup from "mediasoup";
import { mediasoupOptions } from "../socket.constant";
import EventEmitter from "events";

export const workerEvents = new EventEmitter();
export const RECALCULATE_STATS = "recalculate-stats";
export const UPDATE_WORKER_STATS = "updateWorkerStats";
// Background worker stat update processor
workerEvents.on(
    UPDATE_WORKER_STATS,
    ({ worker, producerDelta, consumerDelta }) => {
        log.info("I am being called updateWorkerStats");
        worker.updateStats("producer", producerDelta);
        worker.updateStats("consumer", consumerDelta);
    }
);

// Periodic room stat checker (runs every 5 seconds)
// setInterval(() => {
//   log.info("Running periodic room stat check");
//   rooms.forEach((room, roomId) => {
//     const { producerCount, consumerCount } = room.calculateStats();
//     const worker = room.getWorker();
//     const currentProducerCount = worker.producerCount;
//     const currentConsumerCount = worker.consumerCount;

//     const producerDelta = producerCount - currentProducerCount;
//     const consumerDelta = consumerCount - currentConsumerCount;

//     if (producerDelta !== 0 || consumerDelta !== 0) {
//       log.info(`Updating worker ${worker.index} for room ${roomId}`, {
//         producerDelta,
//         consumerDelta,
//       });
//       workerEvents.emit("updateWorkerStats", {
//         worker,
//         producerDelta,
//         consumerDelta,
//       });
//     }
//   });
// }, 5000);
export const initializeWorkers = async (workers: Map<number, WorkerManager>) => {
    const cpuCount = cpus().length;
    // const workerCount = Math.max(2, Math.floor(cpuCount / 2));
    log.info(`i am triggred ${cpuCount}`);

    const totalCpuForWorker = 5;
    if (totalCpuForWorker < 2) {
        throw APIError.aborted("No cpu core available for creating mediasoup worker");
    }
    for (let i = 1; i <= totalCpuForWorker; i++) {
        const worker = await mediasoup.createWorker(
            mediasoupOptions.workerSettings
        );
        const router = await worker.createRouter({
            mediaCodecs: mediasoupOptions.mediaCodecs,
        });
        workers.set(i, new WorkerManager(i, worker, router));
        log.info(`pid: ${worker.pid} workerIndex: ${i}`);
    }
};

export const getLeastLoadedWorker = (workers: Map<number, WorkerManager>): WorkerManager => {
    let leastLoaded = Array.from(workers.values())
        .filter((w) => w.canHandleRoom())
        .sort((a, b) => a.consumerCount - b.consumerCount)[0];

    if (!leastLoaded) throw APIError.resourceExhausted("No available workers");
    return leastLoaded;
};

// Function to recalculate and reset all worker stats
export const recalculateWorkerStats = (workers: Map<number, WorkerManager>, rooms: Map<string, Room>) => {
    const startTime = process.hrtime(); // Start timing
    // First, reset all worker stats
    workers.forEach((worker) => {
        worker.updateStats("producer", -worker.producerCount);
        worker.updateStats("consumer", -worker.consumerCount);
        worker.roomCount = 0;
    });

    // Recalculate stats from current rooms
    const workerStats = new Map<
        number,
        { producers: number; consumers: number; rooms: number }
    >();

    rooms.forEach((room, _roomId) => {
        const worker = room.getWorker();
        const { producerCount, consumerCount } = room.calculateStats();

        const currentStats = workerStats.get(worker.index) || {
            producers: 0,
            consumers: 0,
            rooms: 0,
        };
        currentStats.producers += producerCount;
        currentStats.consumers += consumerCount;
        currentStats.rooms += 1;

        workerStats.set(worker.index, currentStats);
    });

    // Apply new stats to workers
    workerStats.forEach((stats, workerIndex) => {
        const worker = workers.get(workerIndex);
        if (worker) {
            worker.updateStats("producer", stats.producers);
            worker.updateStats("consumer", stats.consumers);
            worker.roomCount = stats.rooms;
        }
    });
    const statsData = {
        workers: Array.from(workers.entries()).map(([index, worker]) => ({
            index,
            producerCount: worker.producerCount,
            consumerCount: worker.consumerCount,
            roomCount: worker.roomCount,
        })),
    };

    // Calculate duration in milliseconds
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const durationMs = seconds * 1000 + nanoseconds / 1000000;

    log.info("Worker stats recalculated", {
        ...statsData,
        durationMs: Number(durationMs.toFixed(2)), // Round to 2 decimal places
        roomCount: rooms.size,
    });

    return {
        ...statsData,
        durationMs: Number(durationMs.toFixed(2)), // Round to 2 decimal places
    };
};