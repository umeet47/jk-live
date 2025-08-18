import { api } from "encore.dev/api";
import NotificationService from "./notification.service";
import { NotificationDto } from "./notification.interface";

// API to create and send a notification
export const createAndSendNotification = api(
    { expose: true, method: "POST", path: "/notifications/send" },
    async (data: NotificationDto): Promise<{ success: boolean; message: string; }> => {
        await NotificationService.createAndSendNotification(data);
        return { success: true, message: "Notification sent successfully." };
    }
);

//API to delete a notification by ID
export const deleteNotificationById = api(
    { expose: true, method: "DELETE", path: "/notifications/:id" },
    async ({ id }: { id: string }): Promise<{ success: boolean; message: string }> => {
        await NotificationService.deleteNotificationById(id);
        return { success: true, message: "Notification deleted successfully." };
    }
);

// API to fetch all active notifications
export const getAllActiveNotifications = api(
    { expose: true, method: "GET", path: "/notifications/active" },
    async (): Promise<{
        success: boolean; data: {
            id: string;
            title: string;
            description: string;
            expiryDate: Date;
            createdAt: Date;
            updatedAt: Date;
        }[]
    }> => {
        const notifications = await NotificationService.getAllActiveNotifications();
        return { success: true, data: notifications };
    }
);

// API to fetch unread notifications count for a user
export const getUnreadNotificationsCount = api(
    { expose: true, method: "GET", path: "/notifications/unread/count/:userId" },
    async ({ userId }: { userId: string }): Promise<{ success: boolean; count: number }> => {
        const count = await NotificationService.getUnreadNotificationsCount(userId);
        return { success: true, count };
    }
);

// API to mark all notifications as read for a user
export const markAllNotificationsAsRead = api(
    { expose: true, method: "POST", path: "/notifications/mark-read/:userId" },
    async ({ userId }: { userId: string }): Promise<{ success: boolean; message: string }> => {
        await NotificationService.markAllNotificationsAsRead(userId);
        return { success: true, message: "All notifications marked as read." };
    }
);