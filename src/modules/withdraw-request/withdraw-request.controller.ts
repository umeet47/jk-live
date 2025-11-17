import { api } from "encore.dev/api";
import WithdrawService from "./withdraw-request.service";
import { AllWithdrawRequestListResponse, AllWithdrawRequestListWithExtraDataResponse, AllWithdrawRequestListWithUserResponse, CreateWithdrawRequestDto, CreateWithdrawRequestResponse, UpdateWithdrawRequestResponse, WithdrawSummaryResponse } from "./withdraw-request.interface";

// API to create a new withdraw request
export const createWithdrawRequest = api(
    { expose: true, auth: true, method: "POST", path: "/withdraw/request" },
    async (data: CreateWithdrawRequestDto): Promise<CreateWithdrawRequestResponse> => {
        const request = await WithdrawService.createWithdrawRequest(data);
        return { success: true, data: request };
    }
);

// API to update the status of a withdraw request
export const updateWithdrawRequestStatus = api(
    { expose: true, auth: true, method: "PATCH", path: "/withdraw/request/:id/status" },
    async ({ id, status }: { id: string; status: string }): Promise<UpdateWithdrawRequestResponse> => {
        const request = await WithdrawService.updateWithdrawRequestStatus(id, status);
        return { success: true, data: request };
    }
);

// API to get all withdraw requests for a specific user
export const getUserWithdrawRequests = api(
    { expose: true, auth: true, method: "GET", path: "/withdraw/request/user/:userId" },
    async ({ userId }: { userId: string }): Promise<AllWithdrawRequestListWithUserResponse> => {
        const requests = await WithdrawService.getUserWithdrawRequests(userId);
        return { success: true, data: requests };
    }
);

// API to get all pending withdraw requests
export const getPendingWithdrawRequests = api(
    { expose: true, auth: true, method: "GET", path: "/withdraw/request/pending" },
    async (): Promise<AllWithdrawRequestListResponse> => {
        const requests = await WithdrawService.getPendingWithdrawRequests();
        return { success: true, data: requests };
    }
);

// API to get all accepted or rejected withdraw requests
export const getWithdrawRequestsByStatus = api(
    { expose: true, auth: true, method: "GET", path: "/withdraw/request/status/:status" },
    async ({ status }: { status: string }): Promise<AllWithdrawRequestListWithExtraDataResponse> => {
        const requests = await WithdrawService.getWithdrawRequestsByStatus(status);
        return { success: true, data: requests };
    }
);

// API to get total income and total withdrawals for a user
export const getTotalIncomeAndWithdraw = api(
    { expose: true, auth: true, method: "GET", path: "/withdraw/user/:userId/summary" },
    async ({ userId }: { userId: string }): Promise<WithdrawSummaryResponse> => {
        const summary = await WithdrawService.getTotalIncomeAndWithdraw(userId);
        return { success: true, data: summary };
    }
);