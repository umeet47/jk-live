import { APIError } from "encore.dev/api";
import log from "encore.dev/log";
import { RtpCapabilities } from "mediasoup/node/lib/rtpParametersTypes";
import { Server, Socket } from "socket.io";
import DiamondSendPercentageService from "../../diamond-send-percentage/diamond-send-percentage.service";
import LiveStreamService from "../../livestream/livestream.service";
import RoomBlockService from "../../room-block/room-block.service";
import { UserDto } from "../../users/user.interface";
import UserService from "../../users/user.service";
import { Callback, handleEvent } from "../helper/socket.helper";
import { getLeastLoadedWorker } from "../helper/worker.helper";
import { IAcceptVideoCallDto, IEndVideoCallDto, IMakeVideoCallDto, IReceivedVideoCallDto, IRejectVideoCallDto } from "../interfaces/p2p-call.interface";
import {
    DiamondMessageDto,
    IAcceptRequest,
    IAddOwnToProduceList,
    IBlockInRoomMessage,
    IBlockUserInRoomDto,
    IConsumeDto,
    IConsumeResponse,
    IConsumeResumeDto,
    ICreateRoom,
    ICreateWebrtcTransport,
    ICreateWebrtcTransportResponse,
    IDeclineRequest,
    IDeleteRoom,
    IHasJoined,
    IHasProduced,
    IJoinRoom,
    IKickoutFromProducing,
    IKickoutFromRoom,
    ILeaveRoom,
    IProduceDto,
    IProducerPauseDto,
    IProducerResumeDto,
    IRequestToProduce,
    IRoomInfos,
    ISendInroomMessage,
    ITransportConnectDto,
    Member,
    ProducerStat
} from "../interfaces/room.interface";
import { ISendDiamond, ISendDiamondResponse } from "../interfaces/socket.interface";
import { WorkerManager } from "../repositories/worker.service";
import Room from "../services/room.service";
import { EMIT, LISTEN } from "../socket.constant";
import { checkRoomExist } from "../socket.service";

interface ICreateRoomResponse {
    rtpCapabilities: RtpCapabilities;
    roomId: string;
    roomType?: string;
    roomStartTime: number;
    inRoomMessageBlock: boolean;
}
interface IJoinRoomResponse {
    rtpCapabilities: RtpCapabilities
    producerStats: ProducerStat[]
    inRoomMessageBlock: boolean
    roomStartTime: number
    focusUser: string
    members: UserDto[]
    diamondMessageHistory: DiamondMessageDto[]
}
export const handleLiveStreamEvents = (
    socket: Socket,
    io: Server | null,
    rooms: Map<string, Room>,
    workers: Map<number, WorkerManager>,
    roomLiveList: Map<string, boolean>
) => {
    socket.on(
        LISTEN.CREATE_ROOM,
        async (payload: ICreateRoom, callback: Callback<ICreateRoomResponse>) => {
            await handleEvent(socket, LISTEN.CREATE_ROOM, callback,
                async (creator: Member) => {
                    const roomId = creator.id;
                    if (rooms.has(roomId))
                        throw APIError.alreadyExists("Room already exists");

                    const worker = getLeastLoadedWorker(workers);
                    const room = new Room(roomId, creator, worker, "live", payload.roomType);
                    // Track live stream start
                    const startTime = new Date()
                    const userHost = await UserService.getUserInfo(creator.id)
                    const data = {
                        hostId: room.getCreatorInfo().id,
                        roomId,
                        isCreatorHost: userHost.isHost,
                        type: payload.roomType || "video", // or "audio", depending on the stream type
                        startTime,
                    }
                    const liveStream = await LiveStreamService.createNewRecord(data)
                    room.setLiveStreamId(liveStream.id)
                    rooms.set(roomId, room);
                    roomLiveList.set(roomId, false);
                    worker.incrementRooms();

                    const rtpCapabilities = room.addClient(creator);

                    await room.userJoin(creator.id, "creator")
                    await room.addToProduceList(creator.id);

                    const response: ICreateRoomResponse = {
                        rtpCapabilities,
                        roomType: room.getRoomType,
                        roomId,
                        roomStartTime: room.getRoomStartTime,
                        inRoomMessageBlock: room.getInRoomMessageBlock()
                    };
                    return response
                }
            );
        }
    );
    socket.on(
        LISTEN.JOIN_ROOM,
        async ({ roomId }: IJoinRoom, callback: Callback<IJoinRoomResponse>) => {
            await handleEvent(socket, LISTEN.JOIN_ROOM, callback,
                async (user: Member) => {
                    const room = checkRoomExist(roomId);
                    const creator = room.getCreatorInfo();

                    // check if creator has blocked the user from joining the room
                    const isBlocked = await RoomBlockService.findByBlockerAndBlocked(creator.id, user.id);
                    if (isBlocked) {
                        throw APIError.permissionDenied("You are blocked from joining this room.");
                    }
                    // tracking the user timestamp
                    await room.userJoin(user.id, "participant");
                    const rtpCapabilities = room.addClient(user);
                    const ids = room.getMemberIds();
                    const updatedCreator = await UserService.getUserInfoWithAgencyData(creator.id);

                    const focusUser = room.getFocusUser();
                    const producerStats = room.getProducerStats();

                    const memberCount = room.getMemberCount();
                    const members = await UserService.getAllMemberDetails(ids);
                    const member = members.find((m) => m.id === user.id);
                    ids.forEach((id) =>
                        socket
                            .to(id)
                            .emit(EMIT.ROOM_JOINED, { roomId, member: member || user, memberCount, })
                    );
                    socket.broadcast.emit(EMIT.ROOM_UPDATED, {
                        roomId,
                        creator: updatedCreator,
                        memberCount,
                    });
                    const response: IJoinRoomResponse = {
                        rtpCapabilities,
                        producerStats,
                        inRoomMessageBlock: room.getInRoomMessageBlock(),
                        roomStartTime: room.getRoomStartTime,
                        focusUser,
                        members,
                        diamondMessageHistory: room.getDiamondMessageHistory()
                    };
                    return response
                }
            );
        }
    );
    socket.on(
        LISTEN.LEAVE_ROOM,
        async ({ roomId }: ILeaveRoom, callback: Callback<undefined>) => {
            await handleEvent(socket, LISTEN.LEAVE_ROOM, callback,
                async ({ id: memberId }: Member) => {
                    const room = checkRoomExist(roomId);
                    await room.userLeave(memberId);
                    room.removeClient(memberId);
                    const creator = room.getCreatorInfo();
                    const updatedCreator = await UserService.getUserInfoWithAgencyData(creator.id);
                    const memberCount = room.getMemberCount();
                    room.getMemberIds().forEach((id) =>
                        socket
                            .to(id)
                            .emit(EMIT.ROOM_LEFT, { roomId, memberId, memberCount })
                    );
                    socket.broadcast.emit(EMIT.ROOM_UPDATED, {
                        roomId,
                        creator: updatedCreator,
                        memberCount,
                    });

                    return undefined;
                }
            );
        }
    );
    socket.on(
        LISTEN.KICKOUT_FROM_ROOM,
        async (
            { memberId, roomId }: IKickoutFromRoom,
            callback: Callback<undefined>
        ) => {
            await handleEvent(
                socket,
                LISTEN.KICKOUT_FROM_ROOM,
                callback,
                async () => {
                    checkRoomExist(roomId);
                    socket.to(memberId).emit(EMIT.KICKOUT_FROM_ROOM_RESPONSE, { roomId, memberId })

                    return undefined;
                }
            );
        }
    );
    socket.on(
        LISTEN.KICKOUT_FROM_PRODUCING,
        async (
            { memberId, roomId }: IKickoutFromProducing,
            callback: Callback<undefined>
        ) => {
            await handleEvent(
                socket,
                LISTEN.KICKOUT_FROM_PRODUCING,
                callback,
                async () => {
                    const room = checkRoomExist(roomId);
                    // Remove the producer transport for the member
                    room.removeProducerByUserId(memberId);
                    //inform user that he is kicked out
                    io?.emit(EMIT.PRODUCER_KICKOUT, {
                        roomId,
                        memberId
                    })
                    return undefined;
                }
            );
        }
    );
    socket.on(
        LISTEN.DELETE_ROOM,
        async ({ roomId }: IDeleteRoom, callback: Callback<undefined>) => {
            await handleEvent(socket, LISTEN.DELETE_ROOM, callback, async () => {
                const room = checkRoomExist(roomId);
                await room.close();
                rooms.delete(roomId);
                roomLiveList.delete(roomId);
                socket.broadcast.emit(EMIT.ROOM_DELETED, { roomId });
                return undefined;
            });
        }
    );
    socket.on(
        LISTEN.REQUEST_TO_PRODUCE,
        async ({ roomId }: IRequestToProduce, callback: Callback<undefined>) => {
            await handleEvent(
                socket,
                LISTEN.REQUEST_TO_PRODUCE,
                callback,
                async ({ id }: Member) => {
                    const room = checkRoomExist(roomId);
                    const member = room.getMemberInfo(id);
                    room.getMemberIds().map((id) => {
                        socket.to(id).emit(EMIT.REQUEST_BY_USER, { member, roomId });
                    });
                    return undefined;
                }
            );
        }
    );
    socket.on(
        LISTEN.ACCEPT_REQUEST,
        async (
            { roomId, memberId }: IAcceptRequest,
            callback: Callback<undefined>
        ) => {
            await handleEvent(socket, LISTEN.ACCEPT_REQUEST, callback, async () => {
                const room = checkRoomExist(roomId);
                await room.addToProduceList(memberId);
                socket.to(memberId).emit(EMIT.REQUEST_ACCEPTED, { roomId });
                room.getMemberIds().map((id) => {
                    if (id !== memberId) {
                        socket.to(id).emit(EMIT.REQUEST_BY_USER_REMOVED, { roomId, memberId });
                    }
                });
                return undefined;
            });
        }
    );
    socket.on(
        LISTEN.DECLINE_REQUEST,
        async (
            { roomId, memberId }: IDeclineRequest,
            callback: Callback<undefined>
        ) => {
            await handleEvent(
                socket,
                LISTEN.DECLINE_REQUEST,
                callback,
                async () => {
                    const room = checkRoomExist(roomId);
                    socket.to(memberId).emit(EMIT.REQUEST_REJECTED, { roomId });
                    room.getMemberIds().map((id) => {
                        if (id !== memberId) {
                            socket.to(id).emit(EMIT.REQUEST_BY_USER_REMOVED, { roomId, memberId });
                        }
                    });
                    return undefined;
                }
            );
        }
    );
    socket.on(
        LISTEN.HAS_PRODUCED,
        async ({ roomId }: IHasProduced, callback: Callback<undefined>) => {
            await handleEvent(
                socket,
                LISTEN.HAS_PRODUCED,
                callback,
                async ({ id }: Member) => {
                    const room = checkRoomExist(roomId);
                    const ids = room.getMemberIds();
                    const producerStat = room.getProducerStat(id);
                    ids.map((id) => {
                        socket.to(id).emit(EMIT.PRODUCED, { roomId, producerStat });
                    });
                    return undefined;
                }
            );
        }
    );
    socket.on(
        LISTEN.HAS_JOINED,
        async ({ roomId }: IHasJoined, callback: Callback<undefined>) => {
            await handleEvent(
                socket,
                LISTEN.HAS_JOINED,
                callback,
                async ({ id }: Member) => {
                    const room = checkRoomExist(roomId);
                    const ids = room.getMemberIds();
                    const memberDetails = await UserService.getUserInfoWithAgencyData(id);
                    // const memberDetails = room.getMemberDetails(id);
                    const memberCount = room.getMemberCount();

                    ids.map((id) => {
                        socket.to(id).emit(EMIT.MEMBER_JOINED, {
                            roomId,
                            memberDetails,
                            memberCount,
                        });
                    });

                    return undefined;
                }
            );
        }
    );
    socket.on(
        LISTEN.ADD_OWN_TO_PRODUCE_LIST,
        async (
            { roomId }: IAddOwnToProduceList,
            callback: Callback<undefined>
        ) => {
            await handleEvent(
                socket,
                LISTEN.ADD_OWN_TO_PRODUCE_LIST,
                callback,
                async ({ id }: Member) => {
                    const room = checkRoomExist(roomId);
                    await room.addToProduceList(id);
                    io?.to(id).emit(EMIT.REQUEST_ACCEPTED, {
                        roomId,
                    });
                    return undefined;
                }
            );
        }
    );

    //in room conversation part
    socket.on(
        LISTEN.SEND_INROOM_MESSAGE,
        async (
            { data, roomId }: ISendInroomMessage,
            callback: Callback<undefined>
        ) => {
            await handleEvent(
                socket,
                LISTEN.SEND_INROOM_MESSAGE,
                callback,
                async (user: Member) => {
                    const room = checkRoomExist(roomId);
                    const ids = room.getMemberIds();
                    const creatorId = room.getCreatorInfo().id
                    const inRoomMessageBlock = room.getInRoomMessageBlock()
                    if (creatorId !== user.id && inRoomMessageBlock) {
                        throw APIError.permissionDenied("Sending in room message is blocked.")
                    }
                    // const senderInfo = socket.data as Member;
                    const senderInfo = await UserService.findOne(user.id)
                    log.info("senderInfo", senderInfo)

                    ids.map((id) => {
                        io?.to(id).emit(EMIT.INROOM_MESSAGE, { roomId, senderInfo, data });
                    });
                    return undefined;
                }
            );
        }
    );
    socket.on(
        LISTEN.BLOCK_INROOM_MESSAGE,
        async (
            { roomId, isBlock }: IBlockInRoomMessage,
            callback: Callback<undefined>
        ) => {
            await handleEvent(
                socket,
                LISTEN.BLOCK_INROOM_MESSAGE,
                callback,
                async () => {
                    const room = checkRoomExist(roomId);
                    const ids = room.getMemberIds();
                    room.updateInRoomMessageBlockStatus(isBlock)
                    ids.map((id) => {
                        io?.to(id).emit(EMIT.INFORM_INROOM_MESSAGE_BLOCK, { roomId, isBlock });
                    });
                    return undefined;
                }
            );
        }
    );

    //send diamond as gift
    socket.on(
        LISTEN.SEND_DIAMOND,
        async (
            { roomId, amount, receiverId, receiverName }: ISendDiamond,
            callback: Callback<ISendDiamondResponse>
        ) => {
            await handleEvent(
                socket,
                LISTEN.SEND_DIAMOND,
                callback,
                async ({ id, fullname }: Member) => {
                     // Validate amount: must be a number and not negative
                    if (typeof amount !== "number" || Number.isNaN(amount) || amount < 0) {
                        throw APIError.invalidArgument("Amount must be a non-negative number");
                    }

                    const room = checkRoomExist(roomId);
                    const ids = room.getMemberIds();
                    const message: DiamondMessageDto = { senderId: id, senderFullname: fullname, amount, receiverId, receiverFullname: receiverName, createdAt: new Date() };
                    room.addDiamondMessageHistory(message)
                    room.addDiamondToClient(amount, receiverId)
                    const diamondSendPercentage = await DiamondSendPercentageService.findOne();;
                    const multiplier = Number(diamondSendPercentage.percentage) / 100;
                    const diamondBonus = amount * multiplier;
                    if (diamondSendPercentage.subtractFrom === "sender") {
                        room.subtractDiamondFromClient(amount + diamondBonus, id)
                    } else {
                        room.subtractDiamondFromClient(amount - diamondBonus, receiverId)
                    }
                    ids.map((clientId) => {
                        io?.to(clientId)
                            .emit(EMIT.DIAMOND_UPDATE, {
                                roomId,
                                diamondBonus,
                                subtractFrom: diamondSendPercentage.subtractFrom,
                                amount,
                                receiverName,
                                receiverId,
                                senderName: fullname,
                                senderId: id
                            });
                    });
                    io?.emit(EMIT.INFORM_DIAMOND_MESSAGE, { roomId, message })

                    await UserService.transferDiamond(amount, receiverId, id, diamondSendPercentage)

                    return { message }
                }
            );
        }
    );

    // WEBRTC EVENTS
    socket.on(
        LISTEN.CREATE_WEBRTC_TRANSPORT,
        async (
            { roomId, transportType }: ICreateWebrtcTransport,
            callback: Callback<ICreateWebrtcTransportResponse>
        ) => {
            await handleEvent(
                socket,
                LISTEN.CREATE_WEBRTC_TRANSPORT,
                callback,
                async ({ id }: Member) => {
                    const room = checkRoomExist(roomId);
                    const result = await room.createWebRtcTransport(transportType, id);
                    return result;
                }
            );
        }
    );
    socket.on(
        LISTEN.TRANSPORT_CONNECT,
        async ({ roomId, ...rest }: ITransportConnectDto, callback) => {
            await handleEvent(
                socket,
                LISTEN.TRANSPORT_CONNECT,
                callback,
                async ({ id }: Member) => {
                    const room = checkRoomExist(roomId);
                    const result = await room.transportConnect(rest, id);
                    return result;
                }
            );
        }
    );
    socket.on(
        LISTEN.CONSUME,
        async (
            { roomId, ...rest }: IConsumeDto,
            callback: Callback<IConsumeResponse>
        ) => {
            await handleEvent(
                socket,
                LISTEN.CONSUME,
                callback,
                async ({ id }: Member) => {
                    const room = checkRoomExist(roomId);
                    room.startStreamConsumption(id);
                    const result = await room.consume(rest, id);
                    return result;
                }
            );
        }
    );
    socket.on(
        LISTEN.PRODUCE,
        async (
            { roomId, kind, rtpParameters }: IProduceDto,
            callback: Callback<{ id: string }>
        ) => {
            await handleEvent(
                socket,
                LISTEN.PRODUCE,
                callback,
                async ({ id }: Member) => {
                    const room = checkRoomExist(roomId);
                    const result = await room.produce({ kind, rtpParameters }, id);
                    return result;
                }
            );
        }
    );
    socket.on(
        LISTEN.CONSUME_RESUME,
        async (
            { consumerUserId, kind, roomId }: IConsumeResumeDto,
            callback: Callback<undefined>
        ) => {
            await handleEvent(
                socket,
                LISTEN.CONSUME_RESUME,
                callback,
                async ({ id }: Member) => {
                    const room = checkRoomExist(roomId);
                    await room.stopStreamConsumption(id);
                    await room.consumeResume({
                        consumerUserId,
                        kind,
                        userId: id,
                    });
                    return undefined;
                }
            );
        }
    );
    socket.on(
        LISTEN.PRODUCER_PAUSE,
        async (
            { kind, roomId, clientId }: IProducerPauseDto,
            callback: Callback<undefined>
        ) => {
            await handleEvent(socket, LISTEN.PRODUCER_PAUSE, callback, async () => {
                const room = checkRoomExist(roomId);
                await room.producerPause({
                    kind,
                    clientId,
                });

                socket.to(clientId).emit(EMIT.PRODUCER_PAUSE_RESPONSE, {
                    userId: clientId,
                    kind,
                    roomId,
                });
                return undefined;
            });
        }
    );
    socket.on(
        LISTEN.PRODUCER_RESUME,
        async (
            { kind, roomId, clientId }: IProducerResumeDto,
            callback: Callback<undefined>
        ) => {
            await handleEvent(
                socket,
                LISTEN.PRODUCER_RESUME,
                callback,
                async () => {
                    const room = checkRoomExist(roomId);
                    await room.producerResume({ kind, clientId });
                    socket.to(clientId).emit(EMIT.PRODUCER_RESUME_RESPONSE, {
                        userId: clientId,
                        kind,
                        roomId,
                    });
                    return undefined;
                }
            );
        }
    );
    socket.on(
        LISTEN.INFORM_ROOM_CREATED,
        async ({ roomId }: { roomId: string }, callback: Callback<undefined>) => {
            await handleEvent(
                socket,
                LISTEN.INFORM_ROOM_CREATED,
                callback,
                async () => {
                    const room = checkRoomExist(roomId);
                    const creator = await UserService.getUserInfoWithAgencyData(room.getCreatorInfo().id);

                    socket.broadcast.emit(EMIT.ROOM_CREATED, {
                        roomId,
                        roomType: room.getRoomType,
                        creator,
                        memberCount: room.getMemberCount(),
                    });

                    return undefined;
                }
            );
        }
    );
    socket.on(
        LISTEN.GET_ROOM_INFO,
        async ({ roomId }: { roomId: string }, callback: Callback<any>) => {
            await handleEvent(socket, LISTEN.GET_ROOM_INFO, callback, async () => {
                const room = checkRoomExist(roomId);
                return {
                    roomId,
                    creator: room.getCreatorInfo(),
                    isLive: roomLiveList.get(roomId) || false,
                    memberCount: room.getMemberCount(),
                    roomType: room.getRoomType,
                    roomStartTime: room.getRoomStartTime,
                };
            });
        }
    );
    socket.on(
        LISTEN.GET_ALL_ROOMS_INFO,
        async ({ data: _ }: { data: string }, callback: Callback<any>) => {
            await handleEvent(
                socket,
                LISTEN.GET_ALL_ROOMS_INFO,
                callback,
                async () => {
                    const roomData = Array.from(rooms.entries()).map(
                        ([roomId, room]) => ({
                            roomId,
                            creator: room.getCreatorInfo(),
                            isLive: roomLiveList.get(roomId) || false,
                            memberCount: room.getMemberCount(),
                            roomType: room.getRoomType,
                            roomStartTime: room.getRoomStartTime
                        })
                    );

                    return roomData;
                }
            );
        }
    );

    // producer user focus part
    socket.on(
        LISTEN.FOCUS_USER_ROOM,
        async ({ roomId, memberId }: { roomId: string; memberId: string }, callback: Callback<any>) => {
            await handleEvent(
                socket,
                LISTEN.FOCUS_USER_ROOM,
                callback,
                async () => {
                    const room = checkRoomExist(roomId);
                    room.updateFocusUser(memberId)
                    const ids = room.getMemberIds();
                    ids.map((userId) => {
                        io?.to(userId).emit(EMIT.FOCUS_USER_ROOM_RESPONSE, {
                            roomId,
                            memberId,
                        });
                    });
                    return undefined;
                }
            );
        }
    );

    // New events for room status
    socket.on(
        LISTEN.GET_ROOM_STATUS,
        async ({ roomId }: { roomId: string }, callback: Callback<any>) => {
            await handleEvent(
                socket,
                LISTEN.GET_ROOM_STATUS,
                callback,
                async () => {
                    const room = checkRoomExist(roomId);
                    return {
                        roomId,
                        roomType: room.getRoomType,
                        isLive: roomLiveList.get(roomId) || false,
                        creator: room.getCreatorInfo(),
                        memberCount: room.getMemberCount(),
                        roomStartTime: room.getRoomStartTime,
                        videoProducers: Array.from(room.getProducers()).filter(
                            ([_, p]) => p.video
                        ).length,
                        audioProducers: Array.from(room.getProducers()).filter(
                            ([_, p]) => p.audio
                        ).length,
                        consumerCount: Array.from(room.getConsumers()).reduce(
                            (sum, [_, c]) => sum + c.client.size,
                            0
                        ),
                    };
                }
            );
        }
    );
    socket.on(
        LISTEN.GET_ALL_ROOMS,
        async ({ data: _data }: { data: string }, callback: Callback<any>) => {
            await handleEvent(
                socket,
                LISTEN.GET_ALL_ROOMS,
                callback,
                async () => {
                    try {
                        // Use Promise.all to resolve all async operations in the map
                        const roomData: IRoomInfos[] = await Promise.all(
                            Array.from(rooms.entries()).map(async ([roomId, room]) => {
                                const creator: UserDto = await UserService.getUserInfoWithAgencyData(room.getCreatorInfo().id);
                                return {
                                    roomId,
                                    roomType: room.getRoomType,
                                    isLive: roomLiveList.get(roomId) || false,
                                    creator,
                                    memberCount: room.getMemberCount(),
                                    roomStartTime: room.getRoomStartTime,
                                    videoProducers: Array.from(room.getProducers()).filter(
                                        ([_, p]) => p.video
                                    ).length,
                                    audioProducers: Array.from(room.getProducers()).filter(
                                        ([_, p]) => p.audio
                                    ).length,
                                    consumerCount: Array.from(room.getConsumers()).reduce(
                                        (sum, [_, c]) => sum + c.client.size,
                                        0
                                    ),
                                };
                            })
                        );
                        // Group by creator type
                        const vvipRooms = roomData.filter(r => r.creator?.ActivePackage?.type === "vvip");
                        const vipRooms = roomData.filter(r => r.creator?.ActivePackage?.type === "vip");
                        const normalRooms = roomData.filter(
                            r => r.creator?.ActivePackage?.type !== "vvip" && r.creator?.ActivePackage?.type !== "vip"
                        );

                        // Sort each group by memberCount desc
                        const sortByMemberCountDesc = (a: IRoomInfos, b: IRoomInfos) => b.memberCount - a.memberCount;
                        vvipRooms.sort(sortByMemberCountDesc);
                        vipRooms.sort(sortByMemberCountDesc);
                        normalRooms.sort(sortByMemberCountDesc);

                        // Concatenate in order: vvip, vip, normal
                        const sortedRooms = [...vvipRooms, ...vipRooms, ...normalRooms];
                        return sortedRooms;
                        // callback({ success: true, data: sortedRooms });
                    } catch (error) {
                        log.error("Error fetching room data: ", error);
                        callback({ success: false, error: "Failed to fetch room data." });
                    }
                }
            );

        }
    );


    //
    socket.on(LISTEN.REMOVE_DIAMOND, async (data: { amount: number; userId: string }, callback: Callback<undefined>) => {
        await handleEvent(
            socket,
            LISTEN.REMOVE_DIAMOND,
            callback,
            async () => {
                await UserService.removeDiamond(data);
                return undefined;
            }
        );
    })

    // VIDEO P2P CALL EVENTS
    socket.on(
        LISTEN.CREATE_ROOM_FOR_P2P_CALL,
        async (
            _payload: ICreateRoom,
            callback: Callback<{ rtpCapabilities: RtpCapabilities; roomId: string }>
        ) => {
            await handleEvent(
                socket,
                LISTEN.CREATE_ROOM_FOR_P2P_CALL,
                callback,
                async (creator: Member) => {
                    const roomId = creator.id;
                    if (rooms.has(roomId))
                        throw APIError.alreadyExists("Room already exists");

                    const worker = getLeastLoadedWorker(workers);
                    const room = new Room(roomId, creator, worker, "p2p");
                    // Track live stream start
                    const startTime = new Date()
                    const userHost = await UserService.getUserInfo(creator.id)
                    const data = {
                        hostId: room.getCreatorInfo().id,
                        roomId,
                        isCreatorHost: userHost.isHost,
                        type: "video", // or "audio", depending on the stream type
                        startTime,
                    }
                    const liveStream = await LiveStreamService.createNewRecord(data)
                    room.setLiveStreamId(liveStream.id)
                    rooms.set(roomId, room);
                    roomLiveList.set(roomId, false);
                    worker.incrementRooms();

                    const rtpCapabilities = room.addClient(creator);
                    await room.userJoin(creator.id, "creator")
                    await room.addToProduceList(creator.id);

                    return { rtpCapabilities, roomId, roomStartTime: room.getRoomStartTime };
                }
            );
        }
    );
    socket.on(
        LISTEN.JOIN_ROOM_FOR_P2P_CALL,
        async (
            { roomId }: IJoinRoom,
            callback: Callback<{ rtpCapabilities: RtpCapabilities, producerStats: ProducerStat[] }>
        ) => {
            await handleEvent(
                socket,
                LISTEN.JOIN_ROOM_FOR_P2P_CALL,
                callback,
                async (user: Member) => {
                    const room = checkRoomExist(roomId);

                    // tracking the user timestamp
                    const rtpCapabilities = room.addClient(user);
                    await room.userJoin(user.id, "participant");
                    await room.addToProduceList(user.id);

                    const producerStats = room.getProducerStats();

                    return {
                        rtpCapabilities,
                        producerStats,
                        roomStartTime: room.getRoomStartTime,
                    };
                }
            );
        }
    );
    //New events for handling the p2p call logic
    socket.on(LISTEN.MAKE_VIDEO_CALL, async ({ targetUserId, roomId, type }: IMakeVideoCallDto,
        callback: Callback<undefined>) => {
        await handleEvent(socket, LISTEN.MAKE_VIDEO_CALL, callback,
            async ({ id, fullname, profilePic }: Member) => {
                log.info(`Call request from ${fullname} with userId ${id} type ${type}`);

                const room = checkRoomExist(roomId);
                socket.to(targetUserId).emit(EMIT.VIDEO_CALL_MADE, { type, senderId: id, senderName: fullname, senderProfilePic: profilePic, producerStats: room.getProducerStats(), roomId });
                return undefined
            }
        );
    })
    socket.on(LISTEN.RECEIVED_VIDEO_CALL, async ({ targetUserId, roomId }: IReceivedVideoCallDto,
        callback: Callback<undefined>) => {
        await handleEvent(socket, LISTEN.RECEIVED_VIDEO_CALL, callback,
            async ({ id, fullname }: Member) => {
                log.info(`Calling event received from ${fullname} with userId ${id}`);
                const room = checkRoomExist(roomId);
                socket.to(targetUserId).emit(EMIT.VIDEO_CALL_RECEIVED, { senderId: id, senderName: fullname, roomId });
                return undefined
            }
        );
    })

    socket.on(LISTEN.ACCEPT_VIDEO_CALL, async ({ targetUserId, roomId }: IAcceptVideoCallDto,
        callback: Callback<undefined>) => {
        await handleEvent(socket, LISTEN.ACCEPT_VIDEO_CALL, callback,
            async ({ id, fullname }: Member) => {
                log.info(`Call accepted from ${fullname} with userId ${id}`);
                const room = checkRoomExist(roomId);
                socket.to(targetUserId).emit(EMIT.VIDEO_CALL_ACCEPTED, { senderId: id, senderName: fullname, roomId, producerStats: room.getProducerStats() });
                return undefined
            }
        );
    })

    socket.on(LISTEN.DECLINE_VIDEO_CALL, async ({ targetUserId, roomId }: IRejectVideoCallDto,
        callback: Callback<undefined>) => {
        await handleEvent(socket, LISTEN.DECLINE_VIDEO_CALL, callback,
            async ({ id, fullname }: Member) => {
                log.info(`Call declined from ${fullname} with userId ${id}`);
                const room = checkRoomExist(roomId);
                await room.close();
                rooms.delete(roomId);
                roomLiveList.delete(roomId);
                socket.to(targetUserId).emit(EMIT.VIDEO_CALL_DECLINED, { senderId: id, senderName: fullname, roomId });
                return undefined
            }
        );
    })

    socket.on(LISTEN.END_VIDEO_CALL, async ({ targetUserId, roomId }: IEndVideoCallDto,
        callback: Callback<undefined>) => {
        await handleEvent(socket, LISTEN.END_VIDEO_CALL, callback,
            async ({ id, fullname }: Member) => {
                log.info(`Call end from ${fullname} with userId ${id}`);
                const room = checkRoomExist(roomId);
                await room.close();
                rooms.delete(roomId);
                roomLiveList.delete(roomId);
                socket.to(targetUserId).emit(EMIT.VIDEO_CALL_ENDED, { senderId: id, senderName: fullname, roomId });
                return undefined
            }
        );
    })


    // Room block related events
    socket.on(
        LISTEN.BLOCK_USER_IN_ROOM,
        async ({ roomId, blockedId }: IBlockUserInRoomDto, callback: Callback<undefined>) => {
            await handleEvent(
                socket,
                LISTEN.BLOCK_USER_IN_ROOM,
                callback,
                async ({ id }: Member) => {
                    checkRoomExist(roomId);
                    const blockerId = id;
                    const response = await RoomBlockService.blockUser(blockerId, blockedId);
                    socket.to(blockedId).emit(EMIT.BLOCKED_FROM_ROOM, { roomId, data: response });
                    return undefined;
                }
            );
        })
}