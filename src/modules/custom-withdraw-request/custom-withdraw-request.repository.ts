import { Prisma } from "@prisma/client";
import { prisma } from "../../common/database";

const CustomWithdrawRepository = {
    // Create a new custom withdraw request
    createCustomWithdrawRequest: async (data: Prisma.CustomWithdrawRequestUncheckedCreateInput) => {
        return prisma.customWithdrawRequest.create({ data });
    },

    getById: async (id: string) => {
        return prisma.customWithdrawRequest.findUnique({ where: { id } })
    },

    // Update the status of a custom withdraw request
    updateCustomWithdrawRequestStatus: async (id: string, status: string) => {
        return prisma.customWithdrawRequest.update({
            where: { id },
            data: { status },
        });
    },

    // // Get all custom withdraw requests for a specific user
    getUserCustomWithdrawRequests: async (userId: string) => {
        return prisma.customWithdrawRequest.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    },

    // Get all custom withdraw requests
    getCustomWithdrawRequests: async () => {
        return prisma.customWithdrawRequest.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        regNumber: true,
                        profilePic: true
                    }
                }
            }
        });
    },

    // // Get all pending custom withdraw requests
    // getPendingCustomWithdrawRequests: async () => {
    //     return prisma.customWithdrawRequest.findMany({
    //         where: { status: "pending" },
    //         orderBy: { createdAt: "desc" },
    //     });
    // },

    // // Get all accepted or rejected custom withdraw requests
    // getCustomWithdrawRequestsByStatus: async (status: string) => {
    //     return prisma.customWithdrawRequest.findMany({
    //         where: { status },
    //         orderBy: { createdAt: "desc" },
    //         include: {
    //             user: true
    //         }
    //     });
    // },

    // // Get total income and total custom withdrawals for a user
    // getTotalIncomeAndCustomWithdraw: async (userId: string) => {
    //     return await prisma.customWithdrawRequest.findMany({
    //         where: { userId, status: "accepted" },
    //     });
    // },
};

export default CustomWithdrawRepository;