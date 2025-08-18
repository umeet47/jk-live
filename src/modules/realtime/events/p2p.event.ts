import { Server, Socket } from "socket.io";
import { EMIT_P2P, LISTEN_P2P } from "../socket.constant";
import { Callback, handleEvent } from "../helper/socket.helper";
import log from "encore.dev/log";
import { Member } from "../interfaces/room.interface";
import {
    IAnswerDto,
    ICallingReceivedDto,
    IEndCallDto,
    IFetchP2PMessageHistoryDto,
    IMakeCallDto,
    IMarkMessagesAsSeenDto,
    IOfferDto,
    IP2PMuteDto,
    IP2PPauseDto,
    IP2PResumeDto,
    IP2PUnmuteDto,
    IReceivedDto,
    ISendIceCandidateDto,
    MessageHistory,
    P2PMessageDto,
    P2PMessageHistoryResponse
} from "../interfaces/p2p-call.interface";
import P2PMessageRepository from "../../p2p/p2p.repository";
import { UserWithLastMessageDto } from "../../users/user.interface";
import UserService from "../../users/user.service";

export const handleP2PEvents = (socket: Socket, io: Server | null) => {
    //New events for handling the p2p call logic
    socket.on(LISTEN_P2P.MAKE_CALL, async ({ targetUserId }: IMakeCallDto,
        callback: Callback<undefined>) => {
        await handleEvent(socket, LISTEN_P2P.MAKE_CALL, callback,
            async ({ id, fullname }: Member) => {
                log.info(`Call request from ${fullname} with userId ${id}`);
                socket.to(targetUserId).emit(EMIT_P2P.CALLING, { senderId: id, senderName: fullname });
                return undefined
            }
        );
    })

    socket.on(LISTEN_P2P.CALLING_RECEIVED, async ({ targetUserId }: ICallingReceivedDto,
        callback: Callback<undefined>) => {
        await handleEvent(socket, LISTEN_P2P.CALLING_RECEIVED, callback,
            async ({ id, fullname }: Member) => {
                log.info(`Calling event received from ${fullname} with userId ${id}`);
                socket.to(targetUserId).emit(EMIT_P2P.STOP_CALLING_EVENT, { senderId: id, senderName: fullname });
                return undefined
            }
        );
    })
    socket.on(LISTEN_P2P.RECEIVED, async ({ targetUserId }: IReceivedDto,
        callback: Callback<undefined>) => {
        await handleEvent(socket, LISTEN_P2P.RECEIVED, callback,
            async ({ id, fullname }: Member) => {
                log.info(`Call accepted from ${fullname} with userId ${id}`);
                socket.to(targetUserId).emit(EMIT_P2P.CALL_RECEIVED, { senderId: id, senderName: fullname });
                return undefined
            }
        );
    })
    socket.on(LISTEN_P2P.END_CALL, async ({ targetUserId }: IEndCallDto,
        callback: Callback<undefined>) => {
        await handleEvent(socket, LISTEN_P2P.END_CALL, callback,
            async ({ id, fullname }: Member) => {
                log.info(`Call end from ${fullname} with userId ${id}`);
                socket.to(targetUserId).emit(EMIT_P2P.CALL_END, { senderId: id, senderName: fullname });
                return undefined
            }
        );
    })
    socket.on(LISTEN_P2P.P2P_MUTE, async ({ targetUserId }: IP2PMuteDto,
        callback: Callback<undefined>) => {
        await handleEvent(socket, LISTEN_P2P.P2P_MUTE, callback,
            async ({ id, fullname }: Member) => {
                log.info(`audio muted from ${fullname} with userId ${id}`);
                socket.to(targetUserId).emit(EMIT_P2P.P2P_MUTE_RECEIVED, { senderId: id, senderName: fullname });
                io?.to(id).emit(EMIT_P2P.P2P_MUTE_RECEIVED, { senderId: id, senderName: fullname });
                return undefined
            }
        );
    })
    socket.on(LISTEN_P2P.P2P_UNMUTE, async ({ targetUserId }: IP2PUnmuteDto,
        callback: Callback<undefined>) => {
        await handleEvent(socket, LISTEN_P2P.P2P_UNMUTE, callback,
            async ({ id, fullname }: Member) => {
                log.info(`audio unmuted from ${fullname} with userId ${id}`);
                socket.to(targetUserId).emit(EMIT_P2P.P2P_UNMUTE_RECEIVED, { senderId: id, senderName: fullname });
                io?.to(id).emit(EMIT_P2P.P2P_UNMUTE_RECEIVED, { senderId: id, senderName: fullname });
                return undefined
            }
        );
    })
    socket.on(LISTEN_P2P.P2P_PAUSE, async ({ targetUserId }: IP2PPauseDto,
        callback: Callback<undefined>) => {
        await handleEvent(socket, LISTEN_P2P.P2P_PAUSE, callback,
            async ({ id, fullname }: Member) => {
                log.info(`video paused from ${fullname} with userId ${id}`);
                socket.to(targetUserId).emit(EMIT_P2P.P2P_PAUSE_RECEIVED, { senderId: id, senderName: fullname });
                io?.to(id).emit(EMIT_P2P.P2P_PAUSE_RECEIVED, { senderId: id, senderName: fullname });
                return undefined
            }
        );
    })
    socket.on(LISTEN_P2P.P2P_RESUME, async ({ targetUserId }: IP2PResumeDto,
        callback: Callback<undefined>) => {
        await handleEvent(socket, LISTEN_P2P.P2P_RESUME, callback,
            async ({ id, fullname }: Member) => {
                log.info(`video resumed from ${fullname} with userId ${id}`);
                socket.to(targetUserId).emit(EMIT_P2P.P2P_RESUME_RECEIVED, { senderId: id, senderName: fullname });
                io?.to(id).emit(EMIT_P2P.P2P_RESUME_RECEIVED, { senderId: id, senderName: fullname });
                return undefined
            }
        );
    })


    // New events for chat messaging
    socket.on(LISTEN_P2P.SEND_P2P_MESSAGE, async ({ targetUserId, text, messageType }: P2PMessageDto,
        callback: Callback<MessageHistory>) => {
        await handleEvent(socket, LISTEN_P2P.SEND_P2P_MESSAGE, callback,
            async ({ id, fullname }: Member) => {
                log.info(`Message received from ${fullname} with userId ${id}`);
                const p2pMessage = await P2PMessageRepository.store({
                    senderId: id,
                    receiverId: targetUserId,
                    message: text,
                    messageType,
                })
                socket.to(targetUserId).emit(EMIT_P2P.RECEIVED_P2P_MESSAGE, {...p2pMessage, senderName: fullname });
                io?.to(id).emit(EMIT_P2P.RECEIVED_P2P_MESSAGE, {...p2pMessage, senderName: fullname });
                return p2pMessage
            }
        );
    })
    socket.on(
        LISTEN_P2P.MARK_MESSAGES_AS_SEEN,
        async ({ senderId }: IMarkMessagesAsSeenDto, callback: Callback<undefined>) => {
            await handleEvent(socket, LISTEN_P2P.MARK_MESSAGES_AS_SEEN, callback, async ({ id }: Member) => {
                await P2PMessageRepository.markMessagesAsSeen(id, senderId);
                socket.to(senderId).emit(EMIT_P2P.MESSAGES_MARKED_AS_SEEN, { senderId: id });
                return undefined;
            });
        }
    );
    socket.on(LISTEN_P2P.FETCH_P2P_MESSAGE_HISTORY, async (
        { targetUserId, page = 1, pageSize = 20 }: IFetchP2PMessageHistoryDto,
        callback: Callback<P2PMessageHistoryResponse>) => {
        await handleEvent(
            socket,
            LISTEN_P2P.FETCH_P2P_MESSAGE_HISTORY,
            callback,
            async ({ id }: Member) => {
                const skip = (page - 1) * pageSize; // Calculate the number of records to skip
                const take = pageSize; // Number of records to fetch
                const [messageHistory, count] = await P2PMessageRepository.fetchAllAndCount(id, targetUserId, skip, take);
                messageHistory.sort((a, b) => {
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                });
                return { data: messageHistory, totalCount: count }
            }
        )
    })
    socket.on(
        LISTEN_P2P.GET_CONVERSATION_USERS,
        async (_data: unknown, callback: Callback<UserWithLastMessageDto[]>) => {
            await handleEvent(socket, LISTEN_P2P.GET_CONVERSATION_USERS, callback, async ({ id }: Member) => {
                // Fetch all users the current user has conversations with
                const conversations = await P2PMessageRepository.getConversationUsers(id);

                // Extract unique user IDs excluding the current user
                const userIds = new Set<string>();
                conversations.forEach(({ senderId, receiverId }) => {
                    if (senderId !== id) userIds.add(senderId);
                    if (receiverId !== id) userIds.add(receiverId);
                });

                // Fetch user details along with the last message
                const users = await UserService.findByIdsWithLastMessageAndOnlineStatus(Array.from(userIds), id);

                // Return the list of users with their details and last message
                return users
            });
        }
    );

    //New events for p2p peer connection
    socket.on(LISTEN_P2P.OFFER, async (
        { offer, targetUserId }: IOfferDto,
        callback: Callback<undefined>) => {
        await handleEvent(
            socket,
            LISTEN_P2P.OFFER,
            callback,
            async ({ id, fullname }: Member) => {
                log.info(`Offer received from ${fullname} with userId ${id}`);
                socket.to(targetUserId).emit(EMIT_P2P.OFFER_RECEIVED, { offer, senderId: id, senderName: fullname });
                return undefined
            }
        );
    })
    socket.on(LISTEN_P2P.ANSWER, async (
        { answer, targetUserId }: IAnswerDto,
        callback: Callback<undefined>) => {
        await handleEvent(
            socket,
            LISTEN_P2P.ANSWER,
            callback,
            async ({ id, fullname }: Member) => {
                log.info(`Answer received from ${fullname} with userId ${id}`);
                socket.to(targetUserId).emit(EMIT_P2P.ANSWER_RECEIVED, { answer, senderId: id, senderName: fullname });
                return undefined
            }
        );
    })
    socket.on(LISTEN_P2P.ICE_CANDIDATE, async (
        { candidate, targetUserId }: ISendIceCandidateDto,
        callback: Callback<undefined>) => {
        await handleEvent(
            socket,
            LISTEN_P2P.ICE_CANDIDATE,
            callback,
            async ({ id, fullname }: Member) => {
                log.info(`Candidate received from ${fullname} with userId ${id}`);
                socket.to(targetUserId).emit(EMIT_P2P.ICE_CANDIDATE_RECEIVED, { candidate, senderId: id, senderName: fullname });
                return undefined
            }
        );
    })
}