import { NotificationDto } from "./notification.interface";
import NotificationRepository from "./notification.repository";

const NotificationService = {
    createAndSendNotification: async (data: NotificationDto) => {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7); // Set expiry date to 7 days from now

        return NotificationRepository.createAndSendNotification(data, expiryDate);
    },
    deleteNotificationById: async (id: string) => {
        // Ensure the notification exists before attempting to delete
        const notification = await NotificationRepository.getNotificationById(id);
        if (!notification) {
            throw new Error(`Notification with ID ${id} does not exist.`);
        }
        return NotificationRepository.deleteNotificationById(id);
    },
    // Fetch all active notifications
    getAllActiveNotifications: async () => {
        return await NotificationRepository.getAllActiveNotifications();
    },

    // Fetch unread notifications count for a user
    getUnreadNotificationsCount: async (userId: string) => {
        return await NotificationRepository.getUnreadNotificationsCount(userId);
    },

    // Mark all notifications as read for a user
    markAllNotificationsAsRead: async (userId: string) => {
        return await NotificationRepository.ensureNotificationReadEntriesAndMarkAllNotificationAsRead(userId); // Ensure entries exist
    },
};

export default NotificationService;