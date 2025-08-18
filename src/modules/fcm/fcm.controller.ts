// import { api } from "encore.dev/api";
// import FcmService from "./fcm.service";
// import { FcmNotificationPayload, FcmTokenDto, IDeleteTokenResponse, ISaveTokenResponse, ISendNotificationResponse } from "./fcm.interface";

// // Subscribe to a user-specific topic
// export const subscribeToTopic = api(
//     { method: "POST", path: "/fcm/subscribe" },
//     async ({ userId, token }: FcmTokenDto): Promise<ISaveTokenResponse> => {
//         const response = await FcmService.subscribeToUserTopic(userId, token);
//         return { success: true, message: response.message };
//     }
// );

// // Unsubscribe from a user-specific topic
// export const unsubscribeFromTopic = api(
//     { method: "POST", path: "/fcm/unsubscribe" },
//     async ({ userId, token }: FcmTokenDto): Promise<ISaveTokenResponse> => {
//         const response = await FcmService.unsubscribeFromUserTopic(userId, token);
//         return { success: true, message: response.message };
//     }
// );

// // Save FCM token
// export const saveFcmToken = api(
//     { method: "POST", path: "/fcm/token" },
//     async ({ userId, token }: FcmTokenDto): Promise<ISaveTokenResponse> => {
//         await FcmService.saveToken(userId, token);
//         return { success: true, message: "FCM token saved successfully" };
//     }
// );


// // Send notification to a user-specific topic
// export const sendNotificationToTopic = api(
//     { method: "POST", path: "/fcm/notify-topic" },
//     async ({ userId, payload }: { userId: string; payload: FcmNotificationPayload }): Promise<ISendNotificationResponse> => {
//         await FcmService.sendNotificationToTopic(userId, payload);
//         return { success: true, message: "Notification sent to topic successfully" };
//     }
// );

// // Send notification
// export const sendNotification = api(
//     { method: "POST", path: "/fcm/notify" },
//     async ({ userId, payload }: { userId: string; payload: FcmNotificationPayload }): Promise<ISendNotificationResponse> => {
//         await FcmService.sendNotification(userId, payload);
//         return { success: true, message: "Notification sent successfully" };
//     }
// );

// // Delete FCM token
// export const deleteFcmToken = api(
//     { method: "DELETE", path: "/fcm/token/:userId" },
//     async ({ userId }: { userId: string }): Promise<IDeleteTokenResponse> => {
//         await FcmService.deleteToken(userId);
//         return { success: true, message: "FCM token deleted successfully" };
//     }
// );