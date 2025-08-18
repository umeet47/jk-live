import { api } from "encore.dev/api";
import { PersonalNotificationDto } from "./personal-notification.interface";
import PersonalNotificationService from "./personal-notification.service";

// API to fetch all active notifications
export const getAllActivePersonalNotifications = api(
    { expose: true, method: "GET", path: "/personal-notifications/active/:userId" },
    async ({userId}: {userId:string}): Promise<{
        success: boolean; data: PersonalNotificationDto[]
    }> => {
        const notifications = await PersonalNotificationService.getAllActivePersonalNotifications(userId);
        return { success: true, data: notifications };
    }
);

// API to fetch unread personal notifications count for a user
export const getUnreadPersonalNotificationsCount = api(
    { expose: true, method: "GET", path: "/personal-notifications/unread/count/:userId" },
    async ({ userId }: { userId: string }): Promise<{ success: boolean; count: number }> => {
        const count = await PersonalNotificationService.getUnreadPersonalNotificationsCount(userId);
        return { success: true, count };
    }
);

// API to mark all personal notifications as read for a user
export const markAllPersonalNotificationsAsRead = api(
    { expose: true, method: "POST", path: "/personal-notifications/mark-read/:userId" },
    async ({ userId }: { userId: string }): Promise<{ success: boolean; message: string }> => {
        await PersonalNotificationService.markAllPersonalNotificationsAsRead(userId);
        return { success: true, message: "All notifications marked as read." };
    }
);