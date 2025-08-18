import { Server } from "socket.io";
import { createServer } from "http";
import log from "encore.dev/log";
import { EMIT, LISTEN } from "./socket.constant";
import { socketMiddleware } from "../../common/middleware";
import { APIError } from "encore.dev/api";
import Room from "./services/room.service";
import { WorkerManager } from "./repositories/worker.service";
import { Callback, handleEvent } from "./helper/socket.helper";
import { handleRoomEvents } from "./events/agent.event";
import { handleP2PEvents } from "./events/p2p.event";
import { initializeWorkers, RECALCULATE_STATS, recalculateWorkerStats, workerEvents } from "./helper/worker.helper";
import { handleLiveStreamEvents } from "./events/livestream.event";
import { handleFollowUnFollowEvents } from "./events/follow.event";
import UserService from "../users/user.service";

const pendingDisconnects = new Map<string, NodeJS.Timeout>();
let httpServer: ReturnType<typeof createServer> | null = null;
let io: Server | null = null;
const workers: Map<number, WorkerManager> = new Map(); // index, workermanager
const rooms: Map<string, Room> = new Map(); //roomId, room
export const activeUsers = new Map<string, string>(); // userId -> socketId
export const roomLiveList: Map<string, boolean> = new Map(); //roomId, is live or not

workerEvents.on(RECALCULATE_STATS, () => {
  log.info("I am Also being called restartWorkerStats");
  log.info("Running periodic room stat check");
  const startDate = new Date();
  const result = recalculateWorkerStats(workers, rooms);
  log.info(`EndDate: ${Date.now()}`);
  // rooms.forEach((room, roomId) => {
  //   const { producerCount, consumerCount } = room.calculateStats();
  //   const worker = room.getWorker();
  //   const currentProducerCount = worker.producerCount;
  //   const currentConsumerCount = worker.consumerCount;

  //   const producerDelta = producerCount - currentProducerCount;
  //   const consumerDelta = consumerCount - currentConsumerCount;

  //   if (producerDelta !== 0 || consumerDelta !== 0) {
  //     log.info(`Updating worker ${worker.index} for room ${roomId}`, {
  //       producerDelta,
  //       consumerDelta,
  //     });
  //     workerEvents.emit("updateWorkerStats", {
  //       worker,
  //       producerDelta,
  //       consumerDelta,
  //     });
  //   }
  // });
});
export const checkRoomExist = (roomId: string): Room => {
  const room = rooms.get(roomId);
  if (!room) throw APIError.notFound("Room not found");
  return room;
};
// const initializeWorkers = async () => {
//   const cpuCount = cpus().length;
//   // const workerCount = Math.max(2, Math.floor(cpuCount / 2));
//   log.info(`i am triggred ${cpuCount}`);

//   const totalCpuForWorker = 3;
//   if (totalCpuForWorker < 2) {
//     throw APIError.aborted("No cpu core available for creating mediasoup worker");
//   }
//   for (let i = 1; i <= totalCpuForWorker; i++) {
//     const worker = await mediasoup.createWorker(
//       mediasoupOptions.workerSettings
//     );
//     const router = await worker.createRouter({
//       mediaCodecs: mediasoupOptions.mediaCodecs,
//     });
//     workers.set(i, new WorkerManager(i, worker, router));
//     log.info(`pid: ${worker.pid} workerIndex: ${i}`);
//   }
// };

// Initialize Socket.IO server
export const initializeSocketServer = async (): Promise<void> => {
  await initializeWorkers(workers);
  const PORT = 4005;
  log.info("I am being called");
  if (httpServer) httpServer.close();
  httpServer = createServer();
  io = new Server(httpServer, {
    cors: {
      origin: "*", // Allow all origins (update for production)
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,    // 60 seconds before disconnecting inactive clients
    pingInterval: 25000,   // How often to send a ping packet (default 25s)
  });
  io.use(socketMiddleware);

  // Socket.IO connection handler
  io.on("connection", (socket) => {
    const userId = socket.data.id as string
    const fullname = socket.data.fullname as string

    if (!userId) {
      socket.disconnect();
      return;
    }

    // On reconnect, cancel pending cleanup
    if (pendingDisconnects.has(userId)) {
      clearTimeout(pendingDisconnects.get(userId)!);
      pendingDisconnects.delete(userId);
      log.info(`User ${userId} name: ${fullname} reconnected, mediasoup resources preserved.`);
    }

    // Check if the user is already connected
    // if (activeUsers.has(userId)) {
    //   const existingSocketId = activeUsers.get(userId);
    //   const existingSocket = io?.sockets.sockets.get(existingSocketId!);

    //   // Disconnect the existing socket
    //   if (existingSocket) {
    //     existingSocket.disconnect();
    //   }
    // }

    // Add the new connection to the active users map
    const existingSocketId = activeUsers.get(userId);
    if (existingSocketId && existingSocketId !== socket.id) {
      const existingSocket = io?.sockets.sockets.get(existingSocketId);
      if (existingSocket) {
        existingSocket.disconnect(true); // Disconnect old socket
        log.info(`Disconnected previous socket for userId: ${userId}`);
      }
    }
    activeUsers.set(userId, socket.id);
    socket.join(userId);
    log.info(`Client connected: ${socket.id}, userId: ${socket.data.id}`);

    handleRoomEvents(socket, io)
    handleP2PEvents(socket, io)
    handleLiveStreamEvents(socket, io, rooms, workers, roomLiveList)
    handleFollowUnFollowEvents(socket)
    socket.on(
      LISTEN.MESSAGE,
      async (data: unknown, callback: Callback<undefined>) => {
        await handleEvent(socket, LISTEN.MESSAGE, callback, async () => {
          socket.broadcast.emit("message", data);
          return undefined;
        });
      }
    );
    socket.on("ping", async (_data: unknown, callback: Callback<{ data: string }>) => {
      await handleEvent(socket, "ping", callback, async () => {
        return { data: "pong" }
      });
    })

    socket.on(LISTEN.CLEANUP, async (_data: unknown, callback: Callback<undefined>) => {
      await handleEvent(socket, LISTEN.CLEANUP, callback, async () => {
        if (pendingDisconnects.has(userId)) {
          clearTimeout(pendingDisconnects.get(userId)!);
          pendingDisconnects.delete(userId);
          log.info(`User ${userId} pending disconnect is removed.`);
        }
        // Find rooms where this user is present
        for (const [roomId, room] of rooms) {
          const memberIds = room.getMemberIds();
          if (room.getCallType === "p2p") {
            log.info(`P2P room ${roomId} found for user ${userId}`);
            if (memberIds.includes(userId)) {
              // User is in a P2P room, remove them
              await room.close();
              rooms.delete(roomId);
              roomLiveList.delete(roomId);
              memberIds.map((id) => {
                socket.to(id).emit(EMIT.VIDEO_CALL_ENDED, { senderId: id, senderName: fullname, roomId });
              });
              log.info(`User ${userId} removed from P2P room ${roomId}`);
            }
          } else {
            log.info(`Room ${roomId} found for user ${userId}`);
            const creator = room.getCreatorInfo();

            if (memberIds.includes(userId)) {
              if (creator.id === userId) {
                // User is creator, close the room
                await room.close();
                rooms.delete(roomId);
                roomLiveList.delete(roomId);
                socket.broadcast.emit(EMIT.ROOM_DELETED, { roomId });
              } else {
                // User is regular member, remove them from room
                await room.userLeave(userId);
                room.removeClient(userId);
                const creator = room.getCreatorInfo();
                const updatedCreator = await UserService.getUserInfoWithAgencyData(creator.id);
                const memberCount = room.getMemberCount();

                room.getMemberIds().forEach((id) =>
                  socket.to(id).emit(EMIT.ROOM_LEFT, {
                    roomId,
                    memberId: userId,
                    memberCount,
                  })
                );

                socket.broadcast.emit(EMIT.ROOM_UPDATED, {
                  roomId,
                  creator: updatedCreator,
                  memberCount,
                });
                log.info(`User ${userId} removed from room ${roomId} via CLEANUP event.`);
              }
              workerEvents.emit(RECALCULATE_STATS);
              // Break after handling the room since a user can only be in one room
              break;
            }
          }
        }
        return undefined;
      });
    });

    socket.on(LISTEN.DISCONNECT, async () => {
      const startTime = process.hrtime();
      const startDate = new Date();

      try {
        if (pendingDisconnects.has(userId)) return;

        const timer = setTimeout(async () => {
          // --- CLEANUP LOGIC ---
          log.info(`Client disconnected: ${socket.id} with User ${userId}`);
          activeUsers.delete(userId);
          // Find rooms where this user is present
          for (const [roomId, room] of rooms) {
            const memberIds = room.getMemberIds();
            if (room.getCallType === "p2p") {
              log.info(`P2P room ${roomId} found for user ${userId}`);
              if (memberIds.includes(userId)) {
                // User is in a P2P room, remove them
                await room.close();
                rooms.delete(roomId);
                roomLiveList.delete(roomId);
                memberIds.map((id) => {
                  socket.to(id).emit(EMIT.VIDEO_CALL_ENDED, { senderId: id, senderName: fullname, roomId });
                });
                log.info(`User ${userId} removed from P2P room ${roomId}`);
              }
            } else {
              log.info(`Room ${roomId} found for user ${userId}`);
              const creator = room.getCreatorInfo();

              if (memberIds.includes(userId)) {
                if (creator.id === userId) {
                  // User is creator, close the room
                  await room.close();
                  rooms.delete(roomId);
                  roomLiveList.delete(roomId);
                  socket.broadcast.emit(EMIT.ROOM_DELETED, { roomId });

                  workerEvents.emit(RECALCULATE_STATS);

                } else {
                  // User is regular member, remove them from room
                  await room.userLeave(userId);
                  room.removeClient(userId);
                  const creator = room.getCreatorInfo();
                  const updatedCreator = await UserService.getUserInfoWithAgencyData(creator.id);
                  const memberCount = room.getMemberCount();

                  room.getMemberIds().forEach((id) =>
                    socket.to(id).emit(EMIT.ROOM_LEFT, {
                      roomId,
                      memberId: userId,
                      memberCount,
                    })
                  );

                  socket.broadcast.emit(EMIT.ROOM_UPDATED, {
                    roomId,
                    creator: updatedCreator,
                    memberCount,
                  });
                  log.info(`User ${userId} removed from room ${roomId}`);
                }
                workerEvents.emit(RECALCULATE_STATS);
                // Break after handling the room since a user can only be in one room
                break;
              }
            }
          }
          const [seconds, nanoseconds] = process.hrtime(startTime);
          const durationMs = seconds * 1000 + nanoseconds / 1000000;
          const endDate = new Date();

          log.info(`Event ${LISTEN.DISCONNECT} completed`, {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            durationMs: Number(durationMs.toFixed(2)),
            userId,
          });
          pendingDisconnects.delete(userId);
          log.info(`Mediasoup resources cleaned up for userId: ${userId}`);
        }, 10_000);

        pendingDisconnects.set(userId, timer);

        log.info(`User ${userId} disconnected, waiting 10s before mediasoup cleanup.`);

      } catch (error) {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const durationMs = seconds * 1000 + nanoseconds / 1000000;
        const endDate = new Date();
        const message = error instanceof Error ? error.message : String(error);

        log.error(`Event ${LISTEN.DISCONNECT} failed`, {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          durationMs: Number(durationMs.toFixed(2)),
          userId,
          error: message,
        });
      }
    });
  });

  // Handle server errors
  httpServer.on("error", (err: NodeJS.ErrnoException) => {
    log.error(
      `Server error: ${err.code === "EADDRINUSE" ? `Port ${PORT} in use` : err.message
      }`
    );
  });
  httpServer.listen(PORT, () =>
    log.info(`Socket.IO server running on port ${PORT}`)
  );
};

// Get the global `io` instance
export const getSocketInstance = () => {
  if (!io) {
    throw APIError.aborted("Socket.IO server not initialized");
  }
  return io;
};

const shutdown = () => {
  log.info("Shutting down...");
  io?.close();
  httpServer?.close();
  workers.forEach((w) => w.getWorker().close());
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
