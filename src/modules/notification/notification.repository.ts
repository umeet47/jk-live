import log from "encore.dev/log";
import { prismaWithoutExtend } from "../../common/database";
import { REAL_UPDATE } from "../../common/enum";
import { getSocketInstance } from "../realtime/socket.service";
import { NotificationDto } from "./notification.interface";

const NotificationRepository = {
    createAndSendNotification: async (data: NotificationDto, expiryDate: Date) => {
        const io = getSocketInstance()
        return prismaWithoutExtend.$transaction(async (tx) => {
            const notification = await tx.notification.create({
                data: {
                    ...data,
                    expiryDate
                }
            });
            // Create NotificationRead entries for all users
            const users = await tx.user.findMany({
                select: { id: true }
            });
            const notificationReadEntries = users.map((user) => ({
                userId: user.id,
                notificationId: notification.id, // Assuming data.id is the notification ID
                isRead: false, // Initially set to unread
            }));
            await tx.notificationRead.createMany({
                data: notificationReadEntries,
                skipDuplicates: true, // Avoid duplicate entries
            });

            io.emit(REAL_UPDATE.NOTIFICATION, notification);

        })
    },
    deleteNotificationById: async (id: string) => {
        return prismaWithoutExtend.notification.delete({
            where: { id },
        });
    },
    getNotificationById: async (id: string) => {
        return prismaWithoutExtend.notification.findUnique({
            where: { id },
        });
    },
    // Fetch all notifications that are not expired
    getAllActiveNotifications: async () => {
        return prismaWithoutExtend.notification.findMany({
            where: {
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
    getUnreadNotificationsCount: async (userId: string) => {
        return prismaWithoutExtend.notificationRead.count({
            where: {
                userId,
                isRead: false,
                notification: {
                    expiryDate: {
                        gt: new Date(), // Only count notifications that have not expired
                    },
                },
            },
        });
    },

    // Create a NotificationRead entry for a user if it doesn't exist     
    // Mark all notifications as read for a specific user
    ensureNotificationReadEntriesAndMarkAllNotificationAsRead: async (userId: string) => {
        const activeNotifications = await prismaWithoutExtend.notification.findMany({
            where: {
                expiryDate: {
                    gt: new Date(),
                },
            },
        });

        const notificationReadEntries = activeNotifications.map((notification) => ({
            userId,
            notificationId: notification.id,
        }));

        try {
            return prismaWithoutExtend.$transaction(async (tx) => {
                await tx.notificationRead.createMany({
                    data: notificationReadEntries,
                    skipDuplicates: true, // Avoid duplicate entries
                });
                await tx.notificationRead.updateMany({
                    where: {
                        userId,
                        isRead: false,
                    },
                    data: {
                        isRead: true,
                    },
                });
                await tx.notification.deleteMany({
                    where: { expiryDate: { lt: new Date() } }, // Delete expired notifications
                })
            })
        } catch (error) {
            log.error("Error ensuring notification read entries:", error);
            throw error; // Re-throw the error to handle it in the service layer
        }
    },
};

export default NotificationRepository;