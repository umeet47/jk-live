import { prismaWithoutExtend } from "../../common/database";
import { REAL_UPDATE } from "../../common/enum";
import { getSocketInstance } from "../realtime/socket.service";
import { CreatePersonalNotificationDto } from "./personal-notification.interface";

const PersonalNotificationRepository = {
    createAndSendPersonalNotification: async (data: CreatePersonalNotificationDto, expiryDate: Date) => {
        const io = getSocketInstance()
        return prismaWithoutExtend.$transaction(async (tx) => {
            const notification = await tx.personalNotification.create({
                data: {
                    ...data,
                    expiryDate
                }
            });
            io.to(data.userId).emit(REAL_UPDATE.FOLLOW_NOTIFICATION, notification);
        })
    },
    deleteNotificationByUserId: async (userId: string) => {
        return prismaWithoutExtend.personalNotification.deleteMany({
            where: {
                userId,
                expiryDate: {
                    lt: new Date(), // Only count notifications that have not expired
                },
            },
        });
    },
    getPersonalNotificationById: async (id: string) => {
        return prismaWithoutExtend.personalNotification.findUnique({
            where: { id },
        });
    },
    // Fetch all notifications that are not expired
    getAllActivePersonalNotifications: async (userId: string) => {
        return prismaWithoutExtend.personalNotification.findMany({
            where: {
                userId,
                expiryDate: {
                    gt: new Date(), // Only fetch notifications that have not expired
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    },

    // Fetch unread notifications for a specific user
    getUnreadPersonalNotificationsCount: async (userId: string) => {
        return prismaWithoutExtend.personalNotification.count({
            where: {
                userId,
                isRead: false,
                expiryDate: {
                    gt: new Date(), // Only count notifications that have not expired
                },
            },
        });
    },
    updatePersonalNotificationReadStatusByUserId: async (userId: string) => {
        return prismaWithoutExtend.personalNotification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, },
        });
    }
};

export default PersonalNotificationRepository;