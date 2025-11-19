import { APIError } from "encore.dev/api";
import { REAL_UPDATE } from "../../common/enum";
import { getSocketInstance } from "../realtime/socket.service";
import UserService from "../users/user.service";
import { CreateCustomWithdrawRequestDto } from "./custom-withdraw-request.interface";
import CustomWithdrawRepository from "./custom-withdraw-request.repository";
import { Prisma } from "@prisma/client";
import DiamondExchangeService from "../diamond-exchange/diamond-exchange.service";
import { DiamonExchangeEnum } from "../diamond-exchange/diamond-exchange.enum";

const CustomWithdrawService = {
    // Create a new custom withdraw request
    createCustomWithdrawRequest: async (data: CreateCustomWithdrawRequestDto, userId: string) => {
        const user = await UserService.findUserWithHostInfo(userId)
        if (data.diamond < 100000) {
            throw APIError.aborted("Custom Withdraw amount must be greater than 100000")
        }

        if (data.diamond > user.diamond) {
            throw APIError.aborted("Not enough diamond in user account to custom withdraw")
        }

        let type = DiamonExchangeEnum.REGULAR
        if (user.isAgent) {
            type = DiamonExchangeEnum.AGENT
        } else if (user.isHost) {
            const hostRequestUser = user.HostRequestUser[0]
            if (hostRequestUser) {
                type = hostRequestUser.type === "video" ? DiamonExchangeEnum.VIDEO_HOST : DiamonExchangeEnum.AUDIO_HOST
            }
        }
        console.info("type: ", type)
        const diamondExchange = await DiamondExchangeService.getDiamondByType(type)
        const amount = data.diamond / diamondExchange.diamond * diamondExchange.amount
        const payload: Prisma.CustomWithdrawRequestUncheckedCreateInput = {
            accountNumber: data.accountNumber,
            diamond: data.diamond,
            amount,
            userId,
            regNumber: user.regNumber,
            fullname: user.fullname,
            profilePic: user.profilePic,
            paymentType: data.paymentType
        }
        return await CustomWithdrawRepository.createCustomWithdrawRequest(payload);
    },

    // Update the status of a custom withdraw request
    updateCustomWithdrawRequestStatus: async (id: string, status: string) => {
        const customWithdrawRequest = await CustomWithdrawRepository.getById(id);
        if (!customWithdrawRequest) {
            throw APIError.notFound("Custom Withdraw request not found")
        }
        const request = await CustomWithdrawRepository.updateCustomWithdrawRequestStatus(id, status);

        // Notify the user in real-time
        const io = getSocketInstance();
        io.to(request.userId).emit(REAL_UPDATE.CUSTOM_WITHDRAW_REQUEST_RESPONSE, { data: request })

        return request;
    },

    // Get all custom withdraw requests for a specific user
    getUserCustomWithdrawRequests: async (userId: string) => {
        return await CustomWithdrawRepository.getUserCustomWithdrawRequests(userId);
    }, 

    // Get all custom withdraw requests
    getCustomWithdrawRequests: async () => {
        return await CustomWithdrawRepository.getCustomWithdrawRequests();
    },

    // // Get all pending custom withdraw requests
    // getPendingCustomWithdrawRequests: async () => {
    //     return await CustomWithdrawRepository.getPendingCustomWithdrawRequests();
    // },

    // // Get all accepted or rejected custom withdraw requests
    // getCustomWithdrawRequestsByStatus: async (status: string) => {
    //     return await CustomWithdrawRepository.getCustomWithdrawRequestsByStatus(status);
    // },

    // // Get total income and total custom withdrawals for a user
    // getTotalIncomeAndCustomWithdraw: async (userId: string) => {
    //     const customWithdrawRequests = await CustomWithdrawRepository.getTotalIncomeAndCustomWithdraw(userId);
    //     const result = {
    //         totalIncome: 0,
    //         totalWithdraw: 0
    //     }
    //     customWithdrawRequests.forEach(withdraw => {
    //         result.totalIncome = result.totalIncome + withdraw.amount
    //         result.totalWithdraw = result.totalWithdraw + withdraw.amount
    //     })
    //     return result
    // },
};

export default CustomWithdrawService;