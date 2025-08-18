import { CreatePersonalNotificationDto } from "./personal-notification.interface";
import PersonalNotificationRepository from "./personal-notification.repository";

const PersonalNotificationService = {
    createAndSendPersonalNotification: async (data: CreatePersonalNotificationDto) => {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7); // Set expiry date to 7 days from now

        return PersonalNotificationRepository.createAndSendPersonalNotification(data, expiryDate);
    },
    // Fetch all active notifications
    getAllActivePersonalNotifications: async (userId: string) => {
        const data=  await PersonalNotificationRepository.getAllActivePersonalNotifications(userId);
    return data.map(notification => {
        const {senderInfo, ...rest} = notification;
         const res = senderInfo as {
            id: string;
            fullname?: string | null;
            profilePic?: string | null;
         } | null
        return {
            ...rest, 
            senderInfo: res
        }
    })
    },

    // Fetch unread notifications count for a user
    getUnreadPersonalNotificationsCount: async (userId: string) => {
        return await PersonalNotificationRepository.getUnreadPersonalNotificationsCount(userId);
    },

    // Mark all notifications as read for a user
    markAllPersonalNotificationsAsRead: async (userId: string) => {
        // await PersonalNotificationRepository.deleteNotificationByUserId(userId);
        return await PersonalNotificationRepository.updatePersonalNotificationReadStatusByUserId(userId); // Ensure entries exist
    },
};

export default PersonalNotificationService;