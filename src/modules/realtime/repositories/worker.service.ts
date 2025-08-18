import { Router } from "mediasoup/node/lib/RouterTypes";
import { Worker } from "mediasoup/node/lib/WorkerTypes";

export class WorkerManager {
  private readonly worker: Worker;
  private router: Router;
  consumerCount = 0;
  producerCount = 0;
  roomCount = 0;
  index: number;
  private readonly MAX_CONSUMERS = 500;
  constructor(index: number, worker: Worker, router: Router) {
    this.index = index;
    this.worker = worker;
    this.router = router;

    worker.on("died", () => {
      console.error(`Worker ${this.index} died`);
      setTimeout(() => process.exit(1), 2000);
    });
  }
  getRouter() {
    return this.router;
  }
  getWorker() {
    return this.worker;
  }
  canHandleRoom(): boolean {
    return this.consumerCount < this.MAX_CONSUMERS;
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
