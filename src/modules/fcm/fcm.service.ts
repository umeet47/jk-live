// import { fcmMessaging } from "./fcm.config";
// import FcmRepository from "./fcm.repository";
// import { FcmNotificationPayload } from "./fcm.interface";

// const FcmService = {
//     sendNotification: async (userId: string, payload: FcmNotificationPayload) => {
//         const tokenRecord = await FcmRepository.getTokenByUserId(userId);
//         if (!tokenRecord) {
//             throw API.notFound("FCM token not found for the user");
//         }

//         const message = {
//             token: tokenRecord.token,
//             notification: {
//                 title: payload.title,
//                 body: payload.body,
//             },
//             data: payload.data,
//         };

//         return fcmMessaging.send(message);
//     },

//     // Send notification to a specific user topic
//     sendNotificationToTopic: async (userId: string, payload: FcmNotificationPayload) => {
//         const topic = userId; // Topic name based on userId

//         const message = {
//             topic,
//             notification: {
//                 title: payload.title,
//                 body: payload.body,
//             },
//             data: payload.data,
//         };

//         return fcmMessaging.send(message);
//     },

//     // Subscribe a device to a user-specific topic
//     subscribeToUserTopic: async (userId: string, token: string) => {
//         const topic = userId; // Topic name based on userId
//         await fcmMessaging.subscribeToTopic(token, topic);
//         return { success: true, message: `Subscribed to topic ${topic}` };
//     },

//     // Unsubscribe a device from a user-specific topic
//     unsubscribeFromUserTopic: async (userId: string, token: string) => {
//         const topic = userId; // Topic name based on userId
//         await fcmMessaging.unsubscribeFromTopic(token, topic);
//         return { success: true, message: `Unsubscribed from topic ${topic}` };
//     },

//     saveToken: async (userId: string, token: string) => {
//         return FcmRepository.saveToken({ userId, token });
//     },

//     deleteToken: async (userId: string) => {
//         return FcmRepository.deleteToken(userId);
//     },
// };

// export default FcmService;