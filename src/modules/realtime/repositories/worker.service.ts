import { Router } from "mediasoup/node/lib/RouterTypes";
import { Worker } from "mediasoup/node/lib/WorkerTypes";
import mediasoup from "mediasoup";
import log from "encore.dev/log";
import { mediasoupOptions } from "../socket.constant";

export class WorkerManager {
  private worker: Worker;
  private router: Router;
  private restarting = false;
  consumerCount = 0;
  producerCount = 0;
  roomCount = 0;
  index: number;
  private readonly MAX_CONSUMERS = 500;

  constructor(index: number, worker: Worker, router: Router) {
    this.index = index;
    this.worker = worker;
    this.router = router;
    this.attachDeathHandler();
  }
  private attachDeathHandler() {
    this.worker.on("died", async () => {
      log.error(`Worker ${this.index} died, attempting restart...`);
      if (this.restarting) {
        log.warn(`Worker ${this.index} restart already in progress, skipping`);
        return;
      }

      // Reset stats — rooms assigned to this worker are effectively lost
      this.consumerCount = 0;
      this.producerCount = 0;
      this.roomCount = 0;

      try {
        await this.restart();
        log.info(`Worker ${this.index} restarted successfully`);
      } catch (err) {
        log.error(`Worker ${this.index} failed to restart`, { error: String(err) });
      }
    });
  }

  private async restart(): Promise<void> {
    this.restarting = true;
    try {
      const newWorker = await mediasoup.createWorker(
        mediasoupOptions.workerSettings,
      );
      const newRouter = await newWorker.createRouter({
        mediaCodecs: mediasoupOptions.mediaCodecs,
      });

      this.worker = newWorker;
      this.router = newRouter;
      this.attachDeathHandler();

      log.info(`Worker ${this.index} replaced — new pid: ${newWorker.pid}`);
    } finally {
      this.restarting = false;
    }
  }

  getRouter() {
    return this.router;
  }
  getWorker() {
    return this.worker;
  }
  isRestarting(): boolean {
    return this.restarting;
  }
  canHandleRoom(): boolean {
    return !this.restarting && this.consumerCount < this.MAX_CONSUMERS;
  }
  updateStats(type: "consumer" | "producer", delta: number): void {
    if (type === "consumer") {
      this.consumerCount = Math.max(0, this.consumerCount + delta);
    } else {
      this.producerCount = Math.max(0, this.producerCount + delta);
    }
  }

  incrementRooms(): void {
    this.roomCount++;
  }
  decrementRooms(): void {
    this.roomCount = Math.max(0, this.roomCount - 1);
  }
}
