import { APIError } from "encore.dev/api";
import WithdrawRepository from "./withdraw-request.repository";
import { CreateWithdrawRequestDto } from "./withdraw-request.interface";
import DiamondExchangeService from "../diamond-exchange/diamond-exchange.service";
import UserService from "../users/user.service";
import { getSocketInstance } from "../realtime/socket.service";
import { REAL_UPDATE } from "../../common/enum";

const WithdrawService = {
    // Create a new withdraw request
    createWithdrawRequest: async (data: CreateWithdrawRequestDto) => {
        const diamondExchange = await DiamondExchangeService.checkExist(data.diamondExchangeId)
        const user = await UserService.checkExist(data.userId)
        if (diamondExchange.diamond > user.diamond) {
            throw APIError.aborted("Not enough diamond in user account to withdraw")
        }
        const withdrawRequest = await WithdrawRepository.createWithdrawRequest(data);
        return withdrawRequest
    },

    // Update the status of a withdraw request
    updateWithdrawRequestStatus: async (id: string, status: string) => {
        const withdrawRequest = await WithdrawRepository.getById(id);
        if (!withdrawRequest) {
            throw APIError.notFound("Withdraw request not found")
        }
        const request = await WithdrawRepository.updateWithdrawRequestStatus(id, status);

        // Notify the user in real-time
        const io = getSocketInstance();
        io.to(request.userId).emit(REAL_UPDATE.WITHDRAW_REQUEST_RESPONSE, { data: request })

        return request;
    },

    // Get all withdraw requests for a specific user
    getUserWithdrawRequests: async (userId: string) => {
        return await WithdrawRepository.getUserWithdrawRequests(userId);
    },

    // Get all pending withdraw requests
    getPendingWithdrawRequests: async () => {
        return await WithdrawRepository.getPendingWithdrawRequests();
    },

    // Get all accepted or rejected withdraw requests
    getWithdrawRequestsByStatus: async (status: string) => {
        return await WithdrawRepository.getWithdrawRequestsByStatus(status);
    },

    // Get total income and total withdrawals for a user
    getTotalIncomeAndWithdraw: async (userId: string) => {
        const withdrawRequests = await WithdrawRepository.getTotalIncomeAndWithdraw(userId);
        const result = {
            totalIncome: 0,
            totalWithdraw: 0
        }
        withdrawRequests.forEach(withdraw => {
            result.totalIncome = result.totalIncome + withdraw.diamondExchange.amount
            result.totalWithdraw = result.totalWithdraw + withdraw.diamondExchange.diamond
        })
        return result
    },
};

export default WithdrawService;