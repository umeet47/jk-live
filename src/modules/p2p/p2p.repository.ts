import { prismaWithoutExtend } from "../../common/database";
import { StoreMessagePayload } from "../realtime/interfaces/socket.interface";

const P2PMessageRepository = {
    // Delete all messages between two users from the perspective of one user
    clearMessagesForUser: async (userId: string, targetUserId: string) => {
        return prismaWithoutExtend.p2PMessage.deleteMany({
            where: {
                senderId: userId,
                receiverId: targetUserId,
            },
        });
    },

    // Delete all messages sent by one user to another user
    clearMessagesSentByUser: async (userId: string, targetUserId: string) => {
        return prismaWithoutExtend.p2PMessage.updateMany({
            where: {
                senderId: targetUserId,
                receiverId: userId,
            },
            data: {
                deleteForReceiver: true
            }
        });
    },
    fetchAllAndCount: async (senderUserId: string, targetUserId: string, skip: number, take: number) => {
        return prismaWithoutExtend.$transaction([
            prismaWithoutExtend.p2PMessage.findMany({
                where: {
                    OR: [
                        {
                            senderId: senderUserId,
                            receiverId: targetUserId,
                        },
                        {
                            senderId: targetUserId,
                            receiverId: senderUserId,
                            deleteForReceiver: false
                        },
                    ],
                },
                orderBy: {
                    createdAt: "desc", // Sort messages by creation time
                },
                skip,
                take,
            }),
            prismaWithoutExtend.p2PMessage.count({
                where: {
                    OR: [
                        {
                            senderId: senderUserId,
                            receiverId: targetUserId,
                        },
                        {
                            senderId: targetUserId,
                            receiverId: senderUserId,
                            deleteForReceiver: false
                        },
                    ],
                },
            })
        ]);
    },
    markMessagesAsSeen: async (receiverId: string, senderId: string) => {
        return prismaWithoutExtend.p2PMessage.updateMany({
            where: {
                receiverId,
                senderId,
                seen: false, // Only update unseen messages
            },
            data: { seen: true },
        });
    },
    countUnseenMessages: async (receiverId: string, senderId: string) => {
        return prismaWithoutExtend.p2PMessage.count({
            where: {
                receiverId,
                senderId,
                seen: false, // Count only unseen messages
            },
        });
    },
    getConversationUsers: async (userId: string) => {
        return prismaWithoutExtend.p2PMessage.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId },
                ],
            },
            select: {
                senderId: true,
                receiverId: true,
            },
            distinct: ["senderId", "receiverId"], // Ensure unique users
        });
    },
    store: async (data: StoreMessagePayload) => {
        return prismaWithoutExtend.p2PMessage.create({ data })
    }
};

export default P2PMessageRepository;