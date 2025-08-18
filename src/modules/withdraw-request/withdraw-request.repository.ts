import { prisma } from "../../common/database";
import { CreateWithdrawRequestDto } from "./withdraw-request.interface";

const WithdrawRepository = {
    // Create a new withdraw request
    createWithdrawRequest: async ({ diamondExchangeId, paymentType, userFullname, userId, userNumber }: CreateWithdrawRequestDto) => {
        return prisma.withdrawRequest.create({
            data: {
                paymentType,
                userFullname,
                userNumber,
                diamondExchangeId,
                userId
            },
        });
    },

    getById: async (id: string) => {
        return prisma.withdrawRequest.findUnique({ where: { id } })
    },

    // Update the status of a withdraw request
    updateWithdrawRequestStatus: async (id: string, status: string) => {
        return prisma.withdrawRequest.update({
            where: { id },
            data: { status },
        });
    },

    // Get all withdraw requests for a specific user
    getUserWithdrawRequests: async (userId: string) => {
        return prisma.withdrawRequest.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                diamondExchange: true
            }
        });
    },

    // Get all pending withdraw requests
    getPendingWithdrawRequests: async () => {
        return prisma.withdrawRequest.findMany({
            where: { status: "pending" },
            orderBy: { createdAt: "desc" },
        });
    },

    // Get all accepted or rejected withdraw requests
    getWithdrawRequestsByStatus: async (status: string) => {
        return prisma.withdrawRequest.findMany({
            where: { status },
            orderBy: { createdAt: "desc" },
            include: {
                diamondExchange: true,
                user: true
            }
        });
    },

    // Get total income and total withdrawals for a user
    getTotalIncomeAndWithdraw: async (userId: string) => {
        return await prisma.withdrawRequest.findMany({
            where: { userId, status: "accepted" },
            include: { diamondExchange: true }
        });
    },

};

export default WithdrawRepository;