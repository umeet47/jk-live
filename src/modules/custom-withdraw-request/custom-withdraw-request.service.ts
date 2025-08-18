import { APIError } from "encore.dev/api";
import { REAL_UPDATE } from "../../common/enum";
import { getSocketInstance } from "../realtime/socket.service";
import UserService from "../users/user.service";
import { CreateCustomWithdrawRequestDto } from "./custom-withdraw-request.interface";
import CustomWithdrawRepository  from "./custom-withdraw-request.repository";

const CustomWithdrawService = {
    // Create a new custom withdraw request
    createCustomWithdrawRequest: async (data: CreateCustomWithdrawRequestDto) => {
        const user = await UserService.checkExist(data.userId)
        if(data.amount <= 0) {
            throw APIError.aborted("Custom Withdraw amount must be greater than 0")
        }

        if (data.amount > user.diamond) {
            throw APIError.aborted("Not enough diamond in user account to custom withdraw")
        }

        return await CustomWithdrawRepository.createCustomWithdrawRequest(data);
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
    // getUserCustomWithdrawRequests: async (userId: string) => {
    //     return await CustomWithdrawRepository.getUserCustomWithdrawRequests(userId);
    // }, 
    
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