import { api } from "encore.dev/api";
import { AllCustomWithdrawRequestListResponse, CreateCustomWithdrawRequestDto, CreateCustomWithdrawRequestResponse, UpdateCustomWithdrawRequestResponse } from "./custom-withdraw-request.interface";
import CustomWithdrawService from "./custom-withdraw-request.service";

// API to create a new custom withdraw request
export const createCustomWithdrawRequest = api(
    { expose: true, method: "POST", path: "/custom-withdraw/request" },
    async (data: CreateCustomWithdrawRequestDto): Promise<CreateCustomWithdrawRequestResponse> => {
        const request = await CustomWithdrawService.createCustomWithdrawRequest(data);
        return { success: true, data: request };
    }
);

// API to update the status of a custom withdraw request
export const updateCustomWithdrawRequestStatus = api(
    { expose: true, method: "PATCH", path: "/custom-withdraw/request/:id/status" },
    async ({ id, status }: { id: string; status: string }): Promise<UpdateCustomWithdrawRequestResponse> => {
        const request = await CustomWithdrawService.updateCustomWithdrawRequestStatus(id, status);
        return { success: true, data: request };
    }
);

// API to get all custom  withdraw requests
export const getCustomWithdrawRequests = api(
    { expose: true, method: "GET", path: "/custom-withdraw/request" },
    async (): Promise<AllCustomWithdrawRequestListResponse> => {
        const requests = await CustomWithdrawService.getCustomWithdrawRequests();
        return { success: true, data: requests };
    }
);

// // API to get all custom withdraw requests for a specific user
// export const getUserCustomWithdrawRequests = api(
//     { expose: true, method: "GET", path: "/custom-withdraw/request/user/:userId" },
//     async ({ userId }: { userId: string }): Promise<AllCustomWithdrawRequestListWithUserResponse> => {
//         const requests = await CustomWithdrawService.getUserCustomWithdrawRequests(userId);
//         return { success: true, data: requests };
//     }
// );


// // API to get all accepted or rejected custom withdraw requests
// export const getCustomWithdrawRequestsByStatus = api(
//     { expose: true, method: "GET", path: "/custom-withdraw/request/status/:status" },
//     async ({ status }: { status: string }): Promise<AllCustomWithdrawRequestListWithExtraDataResponse> => {
//         const requests = await CustomWithdrawService.getCustomWithdrawRequestsByStatus(status);
//         return { success: true, data: requests };
//     }
// );

// // API to get total income and total custom withdrawals for a user
// export const getTotalIncomeAndCustomWithdraw = api(
//     { expose: true, method: "GET", path: "/custom-withdraw/user/:userId/summary" },
//     async ({ userId }: { userId: string }): Promise<CustomWithdrawSummaryResponse> => {
//         const summary = await CustomWithdrawService.getTotalIncomeAndCustomWithdraw(userId);
//         return { success: true, data: summary };
//     }
// );