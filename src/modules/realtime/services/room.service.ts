import { APIError } from "encore.dev/api";

import { Router } from "mediasoup/node/lib/RouterTypes";
import { EMIT } from "../socket.constant";
import { MediaKind, RtpCapabilities, } from "mediasoup/node/lib/rtpParametersTypes";
import { getSocketInstance, roomLiveList, } from "../socket.service";
import { WorkerManager } from "../repositories/worker.service";
import { DtlsParameters } from "mediasoup/node/lib/WebRtcTransportTypes";
import { Consumer, ConsumerLayers, ConsumerScore, } from "mediasoup/node/lib/ConsumerTypes";
import { Producer } from "mediasoup/node/lib/ProducerTypes";
import { prisma } from "../../../common/database";
import RoomHistoryRepository from "../repositories/roomHistory.repository";
import {
  DiamondMessageDto,
  IConsumePayload,
  IConsumer,
  IConsumeResumePayload,
  ICreateWebrtcTransportResponse,
  IProducePayload,
  IProducer,
  IProducerPausePayload,
  IProducerResumePayload,
  Member,
  ProducerStat,
  TransportType
} from "../interfaces/room.interface";
import log from "encore.dev/log";
import LiveStreamParticipantService from "../../livestream-participant/livestream-participant.service";
import { UPDATE_WORKER_STATS, workerEvents } from "../helper/worker.helper";
import LiveStreamService from "../../livestream/livestream.service";
import ViewerEngagementService from "../../viewer-engagement/viewer-engagement.service";

class Room {
  private liveStreamId: string | undefined;
  private readonly roomId: string;
  private readonly members: Map<string, Member> = new Map();
  private readonly producers: Map<string, IProducer> = new Map();
  private readonly consumers: Map<string, IConsumer> = new Map();
  private readonly creator: Member;
  private readonly producerList: Set<string> = new Set();
  private readonly router: Router;
  private readonly worker: WorkerManager;
  public readonly diamondMessageHistory: DiamondMessageDto[] = []
  private focusUser: string;

  // New properties for tracking
  private readonly userActivity: Map<string, { joinTimes: number[]; totalTime: number }> = new Map();
  private readonly streamConsumption: Map<string, { startTime: number; endTime?: number }> = new Map();
  private roomStartTime: number;
  private roomEndTime?: number;
  private inRoomMessageBlock: boolean;
  public callType: "live" | "p2p"; // Default call type "live" or "p2p"
  public roomType: string; // "audio" | "video"

  constructor(roomId: string, creator: Member, worker: WorkerManager, callType: "live" | "p2p" = "live", roomType = "video") {
    this.roomId = roomId;
    this.creator = creator;
    this.router = worker.getRouter();
    this.worker = worker;
    this.roomStartTime = Date.now();
    this.focusUser = creator.id;
    this.inRoomMessageBlock = false;
    this.callType = callType; // Default call type "live" or "p2p"
    this.roomType = roomType;
  }

  getLiveStreamId() {
    return this.liveStreamId
  }

  setLiveStreamId(liveStreamId: string) {
    this.liveStreamId = liveStreamId
  }

  get getRoomType() {
    return this.roomType
  }

  get getCallType() {
    return this.callType
  }

  get getRoomStartTime() {
    return this.roomStartTime
  }
  get getRoomEndTime() {
    return this.roomEndTime
  }
  get getUserActivity() {
    return this.userActivity
  }

  // Get the number of active streams in the room
  getActiveStreamCount(): number {
    return Array.from(this.streamConsumption.values()).filter((c) => !c.endTime).length;
  }

  getAllMemberDetails(): Member[] {
    return Array.from(this.members.values());
  }

  // Track when a user joins the room
  async userJoin(userId: string, role: string): Promise<void> {
    const now = Date.now();
    if (!this.userActivity.has(userId)) {
      this.userActivity.set(userId, { joinTimes: [], totalTime: 0 });
    }
    this.userActivity.get(userId)!.joinTimes.push(now);

    if (!this.liveStreamId) {
      throw APIError.notFound("Live stream not found");
    }
    // Create a ViewerEngagement record
    const startTime = new Date(now)
    const roomId = this.roomId
    const liveStreamId = this.liveStreamId
    const streamCount = this.getActiveStreamCount()

    await ViewerEngagementService.createNewRecord({
      userId,
      roomId,
      startTime,
      liveStreamId,
      streamCount
    })
    await LiveStreamParticipantService.createNewRecord({
      userId,
      roomId,
      startTime,
      liveStreamId,
      role
    })
  }

  // Track when a user leaves the room
  async userLeave(userId: string): Promise<void> {
    const now = Date.now();
    const activity = this.userActivity.get(userId);
    if (activity && activity.joinTimes.length > 0) {
      const lastJoinTime = activity.joinTimes.pop()!;
      activity.totalTime += now - lastJoinTime;
      const endTime = new Date(now)
      // Update ViewerEngagement record
      await ViewerEngagementService.updateRecord({ userId, roomId: this.roomId, liveStreamId: this.liveStreamId!, endTime })
      await LiveStreamParticipantService.updateRecord({ userId, roomId: this.roomId, liveStreamId: this.liveStreamId!, endTime })
      // Update UserMetrics for total view time
      const duration = Math.floor((now - lastJoinTime) / 1000); // Convert to seconds
      await prisma.userMetrics.upsert({
        where: { userId },
        update: { totalViewTime: { increment: duration } },
        create: { userId, totalViewTime: duration },
      });
    }
  }
  // Track when a stream starts being consumed
  startStreamConsumption(userId: string): void {
    const now = Date.now();
    this.streamConsumption.set(userId, { startTime: now });
  }

  // Track when a stream stops being consumed
  async stopStreamConsumption(userId: string): Promise<void> {
    const now = Date.now();
    const consumption = this.streamConsumption.get(userId);
    if (consumption) {
      consumption.endTime = now;

      // Calculate the duration and update UserMetrics
      const duration = Math.floor((now - consumption.startTime) / 1000); // Convert to seconds
      await prisma.userMetrics.upsert({
        where: { userId },
        update: { totalStreamTime: { increment: duration } },
        create: { userId, totalStreamTime: duration },
      });
    }
  }
  // End the room and calculate total metrics
  endRoom(): void {
    this.roomEndTime = Date.now();
    this.members.forEach((_, userId) => this.userLeave(userId));
  }

  // Calculate total room duration
  getRoomDuration(): number {
    return (this.roomEndTime || Date.now()) - this.roomStartTime;
  }

  // Calculate total consumption time
  getTotalConsumptionTime(): number {
    let totalConsumptionTime = 0;
    this.streamConsumption.forEach(({ startTime, endTime }) => {
      if (endTime) {
        totalConsumptionTime += endTime - startTime;
      }
    });
    return totalConsumptionTime;
  }

  // Calculate total streams consumed
  getTotalStreamsConsumed(): number {
    return this.streamConsumption.size;
  }

  // Calculate user-specific metrics
  getUserMetrics(userId: string): { totalTime: number; streamsConsumed: number } {
    const activity = this.userActivity.get(userId);
    const streamsConsumed = Array.from(this.streamConsumption.keys()).filter(
      (id) => id === userId
    ).length;
    return {
      totalTime: activity?.totalTime || 0,
      streamsConsumed,
    };
  }

  addDiamondMessageHistory(message: DiamondMessageDto) {
    this.diamondMessageHistory.push(message)
  }
  getDiamondMessageHistory() {
    return this.diamondMessageHistory
  }
  addDiamondToClient(amount: number, clientId: string) {
    const client = this.members.get(clientId)
    if (client) {
      log.info("client add diamond to client", client.diamond)
      client.diamond = client.diamond + amount
      log.info("client add diamond to client", client.diamond)
    }
  }
  subtractDiamondFromClient(amount: number, clientId: string) {
    const client = this.members.get(clientId)
    if (client) {
      client.diamond = client.diamond - amount
      client.diamondLevel = client.diamondLevel + amount
    }
  }
  getWorker() {
    return this.worker;
  }
  getMemberDetails(userId: string): Member {
    const member = this.members.get(userId);
    if (!member) {
      throw APIError.notFound("Member details not found");
    }
    return member;
  }
  getProducerStat(userId: string) {
    const producer = this.producers.get(userId);

    if (!producer) {
      throw APIError.notFound("Producer not found");
    }

    const userDetails = this.getMemberDetails(userId);
    const userStat = {
      userId,
      producer: {
        video: producer.video ? true : false,
        audio: producer.audio ? true : false,
      },
      userDetails,
    };

    return userStat;
  }
  getProducerStats() {
    const stats: ProducerStat[] = [];
    this.producers.forEach((producer, userId) => {
      const userDetails = this.getMemberDetails(userId);
      const userStat = {
        userId,
        producer: {
          video: producer.video ? true : false,
          isVideoPause: producer.video?.paused ? true : false,
          isAudioPause: producer.audio?.paused ? true : false,
          audio: producer.audio ? true : false,
        },
        userDetails,
      };
      stats.push(userStat);
    });
    return stats;
  }
  getProducers(): Map<string, IProducer> {
    return this.producers;
  }

  getConsumers(): Map<string, IConsumer> {
    return this.consumers;
  }

  getRoomId(): string {
    return this.roomId;
  }

  getMemberIds(): string[] {
    return Array.from(this.members.keys());
  }

  updateInRoomMessageBlockStatus(isBlock: boolean) {
    this.inRoomMessageBlock = isBlock
  }

  getInRoomMessageBlock() {
    return this.inRoomMessageBlock
  }

  getMemberCount(): number {
    return this.members.size;
  }

  getCreatorInfo(): Member {
    return this.creator;
  }
  getFocusUser(): string {
    return this.focusUser;
  }

  getMemberInfo(memberId: string): Member {
    const member = this.members.get(memberId);
    if (!member) throw APIError.notFound("User not in room");
    return member;
  }
  calculateStats(): { producerCount: number; consumerCount: number } {
    const producerCount = Array.from(this.producers.values()).reduce(
      (count, producer) =>
        count + (producer.video ? 1 : 0) + (producer.audio ? 1 : 0),
      0
    );

    const consumerCount = Array.from(this.consumers.values()).reduce(
      (count, consumer) => {
        let streamCount = 0;
        consumer.client.forEach((client) => {
          streamCount += (client.video ? 1 : 0) + (client.audio ? 1 : 0);
        });
        return count + streamCount;
      },
      0
    );

    return { producerCount, consumerCount };
  }

  updateFocusUser(memberId: string) {
    this.focusUser = memberId
  }

  async addToProduceList(memberId: string): Promise<void> {
    if (!this.members.has(memberId))
      throw APIError.notFound("Member not found");
    this.producerList.add(memberId);
    // Track producer activity (start time)
    await prisma.producerActivity.create({
      data: {
        userId: memberId,
        roomId: this.roomId,
        liveStreamId: this.liveStreamId!,
        type: "video", // You can adjust this type if needed
        startTime: new Date(),
      },
    }).catch((error) => {
      console.error(`Failed to create ProducerActivity for user ${memberId}:`, error);
    });
  }

  addClient(user: Member): RtpCapabilities {
    if (this.members.has(user.id))
      throw APIError.alreadyExists("Member already added");
    this.members.set(user.id, user);
    return this.router.rtpCapabilities;
  }

  async removeProducerByUserId(memberId: string): Promise<void> {
    const producer = this.producers.get(memberId);
    const producerCount = producer
      ? (producer.video ? 1 : 0) + (producer.audio ? 1 : 0)
      : 0;
    if (!producer) {
      log.warn(`Producer not found for userId: ${memberId} in room ${this.roomId}`);
      return; // Gracefully exit if producer is already removed
    // Optionally: return false or a status if you want to signal this upstream
    }
    producer.video?.close();
    producer.audio?.close();
    producer.transport.close();
    this.producers.delete(memberId);
    this.producerList.delete(memberId);
    this.worker.updateStats("producer", -producerCount);
    this.checkLiveStatus();
    // Update producer activity (end time)
    await prisma.producerActivity.updateMany({
      where: {
        userId: memberId,
        roomId: this.roomId,
        liveStreamId: this.liveStreamId!,
        endTime: null, // Ensure we update only ongoing activities
      },
      data: {
        endTime: new Date(),
      },
    }).catch((error) => {
      console.error(`Failed to update ProducerActivity for user ${memberId}:`, error);
    });

  }

  async removeClient(userId: string): Promise<void> {
    const producer = this.producers.get(userId);
    const consumer = this.consumers.get(userId);

    const producerCount = producer
      ? (producer.video ? 1 : 0) + (producer.audio ? 1 : 0)
      : 0;
    const consumerCount = consumer
      ? Array.from(consumer.client.values()).reduce(
        (count, client) =>
          count + (client.video ? 1 : 0) + (client.audio ? 1 : 0),
        0
      )
      : 0;
    if (producer) {
      producer.video?.close();
      producer.audio?.close();
      producer.transport.close();
      this.producers.delete(userId);
    }

    if (consumer) {
      consumer.client.forEach((client) => {
        client.audio?.close();
        client.video?.close();
      });
      consumer.transport.close();
      this.consumers.delete(userId);
    }

    this.members.delete(userId);
    this.producerList.delete(userId);
    if (this.producerList.has(userId)) {
      // Update producer activity (end time)
      await prisma.producerActivity.updateMany({
        where: {
          userId,
          roomId: this.roomId,
          liveStreamId: this.liveStreamId!,
          endTime: null, // Ensure we update only ongoing activities
        },
        data: {
          endTime: new Date(),
        },
      }).catch((error) => {
        console.error(`Failed to update ProducerActivity for user ${userId}:`, error);
      });
    }

    this.worker.updateStats("producer", -producerCount);
    this.worker.updateStats("consumer", -consumerCount);
    this.checkLiveStatus();
  }

  removeFromProduceList(memberId: string): void {
    this.producerList.delete(memberId);
  }

  async close(): Promise<void> {
    // Update producer activity (end time)
    await prisma.producerActivity.updateMany({
      where: {
        liveStreamId: this.liveStreamId!,
        endTime: null, // Ensure we update only ongoing activities
      },
      data: {
        endTime: new Date(),
      },
    }).catch((error) => {
      console.error(`Failed to update ProducerActivity for liveStreamId ${liveStreamId}:`, error);
    });

    this.endRoom();
    //Update live stream end time
    const liveStreamId = this.getLiveStreamId()
    if (liveStreamId) {
      const liveStream = await LiveStreamService.updateLiveStreamEndTime(this.liveStreamId!, new Date())
      log.info(`Live stream updated: ${JSON.stringify(liveStream, null, 2)}`);
    }
    const roomHistory = await RoomHistoryRepository.saveRoomHistory(this)
    // log.info(`Room History ${JSON.stringify(roomHistory, null, 2)}`);

    // const totalDuration = room.getRoomDuration();
    // const totalConsumptionTime = room.getTotalConsumptionTime();
    // const totalStreamsConsumed = room.getTotalStreamsConsumed();

    // log.info(`Room ${roomId} Metrics:`);
    // log.info(`Total Duration: ${totalDuration} ms`);
    // log.info(`Total Consumption Time: ${totalConsumptionTime} ms`);
    // log.info(`Total Streams Consumed: ${totalStreamsConsumed}`);

    let totalProducers = 0;
    let totalConsumers = 0;

    this.producers.forEach((producer) => {
      totalProducers += (producer.video ? 1 : 0) + (producer.audio ? 1 : 0);
      producer.video?.close();
      producer.audio?.close();
      producer.transport.close();
    });
    this.producers.clear();

    this.consumers.forEach((consumer) => {
      totalConsumers += consumer.client.size * 2;
      consumer.client.forEach((client) => {
        client.audio?.close();
        client.video?.close();
      });
      consumer.transport.close();
    });
    this.consumers.clear();

    this.members.clear();
    this.producerList.clear();

    this.worker.updateStats("producer", -totalProducers);
    this.worker.updateStats("consumer", -totalConsumers);
    this.worker.decrementRooms();

    // Queue background stat update
    const { producerCount, consumerCount } = this.calculateStats(); // Will be 0 after clear, but kept for consistency
    workerEvents.emit(UPDATE_WORKER_STATS, {
      worker: this.worker,
      producerDelta: -producerCount,
      consumerDelta: -consumerCount,
    });
    this.worker.decrementRooms();
    // getSocketInstance().emit(EMIT.ROOM_DELETED, { roomId: this.roomId });
  }

  async createWebRtcTransport(
    transportType: TransportType,
    userId: string
  ): Promise<ICreateWebrtcTransportResponse> {
    if (!this.members.has(userId)) throw APIError.notFound("User not in room");
    if (
      transportType === TransportType.producer &&
      !this.producerList.has(userId)
    )
      throw APIError.notFound("User not in producer list");

    const transport = await this.router.createWebRtcTransport({
      listenIps: [{ ip: process.env.IP as string, announcedIp: process.env.ANNOUNCED_IP }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      enableSctp: true,
      initialAvailableOutgoingBitrate: 100000,
      appData: { userId, transportType },
    });

    if (transportType === TransportType.producer) {
      if (this.producers.has(userId))
        throw APIError.alreadyExists("Producer exists");
      this.producers.set(userId, { transport });
    } else {
      if (this.consumers.has(userId))
        throw APIError.alreadyExists("Consumer exists");
      this.worker.updateStats("consumer", 1);
      this.consumers.set(userId, { transport, client: new Map() });
    }

    return {
      params: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      },
      transportType,
    };
  }
  async produce(
    { kind, rtpParameters }: IProducePayload,
    userId: string
  ): Promise<{ id: string }> {
    const producer = this.getProducerByUserId(userId);
    const transport = producer.transport;

    const mediaProducer = await transport.produce({
      kind,
      rtpParameters,
      appData: { userId, kind },
    });

    mediaProducer.on("transportclose", () => {
      mediaProducer.close();
      if (kind === "video") delete producer.video;
      else delete producer.audio;
      this.worker.updateStats("producer", -1);
      this.checkLiveStatus();
    });

    if (kind === "video") {
      if (producer.video) throw APIError.alreadyExists("Video Producer exists");
      producer.video = mediaProducer;
    } else {
      if (producer.audio) throw APIError.alreadyExists("Audio Producer exists");
      producer.audio = mediaProducer;
    }

    this.worker.updateStats("producer", 1);
    this.checkLiveStatus();
    return { id: mediaProducer.id };
  }
  async consume(
    { kind, rtpCapabilities, clientId }: IConsumePayload,
    userId: string
  ) {
    try {
      console.info(`room ${this.roomId} consume - kind - ${kind} `);
      if (clientId === userId) {
        throw APIError.aborted("Cannot consume own data");
      }
      const target_producer = this.getProducerValueByKind(kind, clientId);
      if (
        !target_producer ||
        !rtpCapabilities ||
        !this.router.canConsume({
          producerId: target_producer.id,
          rtpCapabilities,
        })
      ) {
        throw APIError.canceled(
          `Couldn't consume kind ${kind} with 'userId'=${userId} and 'roomId'=${this.roomId} and target userId: ${clientId} and producerId: ${target_producer.id}`
        );
      }

      const userConsumer = this.getConsumerByUserId(userId);
      const transport = userConsumer.transport;
      const consumer = await transport.consume({
        producerId: target_producer.id,
        rtpCapabilities,
        paused: kind === "video",
        appData: { userId, kind, producer_user_id: clientId },
      });

      const clients = userConsumer.client;
      const client = clients.get(clientId);
      switch (kind) {
        case "video":
          if (!client) {
            clients.set(clientId, { video: consumer });
          } else {
            if (client.video) {
              throw APIError.alreadyExists("Video already consumed");
            }
            clients.set(clientId, { video: consumer });
          }
          consumer.on("producerclose", async () => {
            const ioInstance = getSocketInstance();
            ioInstance.to(userId).emit(EMIT.PRODUCER_CLOSE_RESPONSE, {
              userId: clientId,
              kind,
              roomId: this.roomId,
            });
            consumer.close();
            delete client?.video;
          });
          break;
        case "audio":
          if (!client) {
            clients.set(clientId, { audio: consumer });
          } else {
            if (client.audio) {
              throw APIError.alreadyExists("Audio already consumed");
            }
            clients.set(clientId, { audio: consumer });
          }
          consumer.on("producerclose", async () => {
            const ioInstance = getSocketInstance();
            ioInstance.to(userId).emit(EMIT.PRODUCER_CLOSE_RESPONSE, {
              userId: clientId,
              kind,
              roomId: this.roomId,
            });
            consumer.close();
            delete client?.audio;
          });
          break;
      }

      consumer.on("transportclose", async () => {
        consumer.close();
        clients.delete(clientId);
      });
      consumer.on("producerpause", async () => {
        const ioInstance = getSocketInstance();
        ioInstance.to(userId).emit(EMIT.PRODUCER_PAUSE_RESPONSE, {
          userId: clientId,
          kind,
          roomId: this.roomId,
        });
        await consumer.pause();
      });
      consumer.on("producerresume", async () => {
        const ioInstance = getSocketInstance();
        ioInstance.to(userId).emit(EMIT.PRODUCER_RESUME_RESPONSE, {
          userId: clientId,
          kind,
          roomId: this.roomId,
        });
        await consumer.resume();
      });
      consumer.on("score", (_score: ConsumerScore) => {
        // console.info(
        //   `room ${
        //     this.roomId
        //   } userId: ${userId} consumer kind ${kind} score ${JSON.stringify(
        //     score
        //   )} and target userid: ${target.userId} and producerId: ${
        //     target_producer.id
        //   }`
        // );
      });
      consumer.on("layerschange", (_layers: ConsumerLayers | undefined) => {
        // console.info(
        //   `room ${
        //     this.roomId
        //   } userId: ${userId} consumer kind ${kind} layerschange ${JSON.stringify(
        //     layers
        //   )} and target userid: ${target.userId} and producerId: ${
        //     target_producer.id
        //   }`
        // );
      });

      if (consumer.kind === "video") {
        await consumer.resume();
      }

      return {
        producerId: target_producer.id,
        id: consumer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        type: consumer.type,
        producerPaused: consumer.producerPaused,
      };
    } catch (error) {
      console.error(`Room - consume method roomId: ${this.roomId}`);
      throw error;
    }
  }
  async transportConnect(
    {
      dtlsParameters,
      transportType,
    }: { dtlsParameters: DtlsParameters; transportType: TransportType },
    userId: string
  ) {
    try {
      const transport =
        transportType === TransportType.producer
          ? this.getProducerByUserId(userId).transport
          : this.getConsumerByUserId(userId).transport;
      if (!transport) {
        throw APIError.canceled(
          `Couldn't find ${transportType} transport with 'userId'=${userId} and 'roomId'=${this.roomId}`
        );
      }

      await transport.connect({ dtlsParameters });

      return { success: true };
    } catch (error) {
      console.error(`Room - transportConnect method roomId: ${this.roomId}`);
      throw error;
    }
  }
  async consumeResume({
    consumerUserId,
    kind,
    userId,
  }: IConsumeResumePayload): Promise<void> {
    try {
      const userConsumer = this.getConsumerValueByKind(
        kind,
        userId,
        consumerUserId
      );

      if (userConsumer.paused) {
        await userConsumer.resume();
      }
      return;
    } catch (error) {
      console.error(
        `Room - consumeResume method roomId: ${this.roomId} kind: ${kind}`
      );
      throw error;
    }
  }
  async producerPause({ kind, clientId }: IProducerPausePayload) {
    try {
      console.info(`room ${this.roomId} producer pause kind: ${kind} `);

      const producer = this.getProducerValueByKind(kind, clientId);

      if (!producer.paused) {
        await producer.pause();
      }

      return;
    } catch (error) {
      console.error(
        `Room - producerPause method kind: ${kind}  roomId: ${this.roomId}`
      );
      throw error;
    }
  }
  async producerResume({ kind, clientId }: IProducerResumePayload) {
    try {
      console.info(`room ${this.roomId} producer resume kind: ${kind} `);

      const producer = this.getProducerValueByKind(kind, clientId);

      if (producer.paused) {
        await producer.resume();
      }

      return;
    } catch (error) {
      console.error(
        `Room - producerResume method kind: ${kind}  roomId: ${this.roomId}`
      );
      throw error;
    }
  }

  private checkLiveStatus(): void {
    const hasVideo = Array.from(this.producers.values()).some((p) => p.video);
    const hasAudio = Array.from(this.producers.values()).some((p) => p.audio);
    const isLive = hasVideo && hasAudio;

    if (roomLiveList.get(this.roomId) !== isLive) {
      roomLiveList.set(this.roomId, isLive);
      getSocketInstance().emit(EMIT.ROOM_LIVE_STATUS, {
        roomId: this.roomId,
        isLive,
      });
    }
  }
  getProducerByUserId(userId: string): IProducer {
    const producer = this.producers.get(userId);
    if (!producer) throw APIError.notFound("Producer not found");
    return producer;
  }
  private getConsumerByUserId(userId: string): IConsumer {
    const consumer = this.consumers.get(userId);
    if (!consumer) {
      throw APIError.notFound("Consumer transport not found");
    }
    return consumer;
  }
  private getProducerValueByKind(kind: MediaKind, userId: string): Producer {
    const producer = this.producers.get(userId);
    if (!producer) {
      throw APIError.notFound("Producer not found");
    }

    if (kind === "video") {
      const video = producer.video;
      if (!video) {
        throw APIError.notFound("Video Producer not found");
      }
      return video;
    } else {
      const audio = producer.audio;
      if (!audio) {
        throw APIError.notFound("Audio Producer not found");
      }
      return audio;
    }
  }
  private getConsumerValueByKind(
    kind: MediaKind,
    userId: string,
    clientId: string
  ): Consumer {
    const consumer = this.consumers.get(userId);
    if (!consumer) {
      throw APIError.notFound("Consumer not found");
    }
    const clientConsumer = consumer.client.get(clientId);
    if (!clientConsumer) {
      throw APIError.notFound(
        "Consumer of given client for given user not found"
      );
    }

    if (kind === "video") {
      const video = clientConsumer.video;
      if (!video) {
        throw APIError.notFound("Video Producer not found");
      }
      return video;
    } else {
      const audio = clientConsumer.audio;
      if (!audio) {
        throw APIError.notFound("Audio Producer not found");
      }
      return audio;
    }
  }
}

export default Room;
