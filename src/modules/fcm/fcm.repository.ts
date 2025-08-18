// import { prisma } from "../../common/database";
// import { FcmTokenDto } from "./fcm.interface";

// const FcmRepository = {
//     saveToken: async (data: FcmTokenDto) => {
//         return prisma.fcmToken.upsert({
//             where: { userId: data.userId },
//             update: { token: data.token },
//             create: data,
//         });
//     },

//     getTokenByUserId: async (userId: string) => {
//         return prisma.fcmToken.findUnique({
//             where: { userId },
//         });
//     },

//     deleteToken: async (userId: string) => {
//         return prisma.fcmToken.delete({
//             where: { userId },
//         });
//     },
// };

// export default FcmRepository;