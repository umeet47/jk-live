import { api, APIError } from "encore.dev/api";
import ResellerService from "./reseller.service";
import { ResellerTransferDiamondDto, SuccessResellerCreatedResponse, SuccessResellerRemovedResponse, SuccessResellersListResponse, SuccessResellerTransferDiamondResponse, SuccessResellerTransferHistoryListResponse } from "./reseller.interface";
import { getAuthData } from "~encore/auth";

// API to make a user a reseller
export const makeReseller = api(
    { expose: true, auth: true, method: "PATCH", path: "/reseller/make/:regNo" },
    async ({ regNo }: { regNo: number }): Promise<SuccessResellerCreatedResponse> => {
        await ResellerService.makeReseller(regNo);
        const role = getAuthData()!.role;
        if (role !== "ADMIN") {
            throw APIError.permissionDenied("Not allowed")
        }
        return { success: true, message: "User is now a reseller." };
    }
);

// API to remove a user from reseller
export const removeReseller = api(
    { expose: true, auth: true, method: "PATCH", path: "/reseller/remove/:regNo" },
    async ({ regNo }: { regNo: number }): Promise<SuccessResellerRemovedResponse> => {
        await ResellerService.removeReseller(regNo);
        const role = getAuthData()!.role;
        if (role !== "ADMIN") {
            throw APIError.permissionDenied("Not allowed")
        }
        return { success: true, message: "User is no longer a reseller." };
    }
);

// API to list all resellers
export const listResellers = api(
    { expose: true, auth: true, method: "GET", path: "/reseller/list" },
    async (): Promise<SuccessResellersListResponse> => {
        const resellers = await ResellerService.listResellers();
        return { success: true, data: resellers };
    }
);
// API to transfer diamonds
export const transferDiamonds = api(
    { expose: true, auth: true, method: "POST", path: "/reseller/transfer" },
    async ({ senderId, receiverId, diamond }: ResellerTransferDiamondDto): Promise<SuccessResellerTransferDiamondResponse
    > => {
        // Validate diamond: must be a number and not negative
        if (typeof diamond !== "number" || Number.isNaN(diamond) || diamond < 0) {
            throw APIError.invalidArgument("Diamond must be a non-negative number");
        }
        const isReseller = getAuthData()!.isReseller;
        if (!isReseller) {
            throw APIError.permissionDenied("Not Allowed")
        }
        const transfer = await ResellerService.transferDiamonds(senderId, receiverId, diamond);
        return { success: true, data: transfer };
    }
);

// API to list reseller transaction history
export const listResellerHistory = api(
    { expose: true, auth: true, method: "GET", path: "/reseller/history/:resellerId" },
    async ({ resellerId }: { resellerId: string }): Promise<SuccessResellerTransferHistoryListResponse> => {
        const history = await ResellerService.getResellerHistory(resellerId);
        return { success: true, data: history };
    }
);