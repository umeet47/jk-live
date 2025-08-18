import { api } from "encore.dev/api";
import ResellerService from "./reseller.service";
import { ResellerTransferDiamondDto, SuccessResellerCreatedResponse, SuccessResellerRemovedResponse, SuccessResellersListResponse, SuccessResellerTransferDiamondResponse, SuccessResellerTransferHistoryListResponse } from "./reseller.interface";

// API to make a user a reseller
export const makeReseller = api(
    { expose: true, method: "PATCH", path: "/reseller/make/:regNo" },
    async ({ regNo }: { regNo: number }): Promise<SuccessResellerCreatedResponse> => {
        // try {
        await ResellerService.makeReseller(regNo);
        return { success: true, message: "User is now a reseller." };
        // } catch (error) {
        //     throw APIError.unknown(error?.toString() || "Error making user a reseller.");
        // }
    }
);

// API to remove a user from reseller
export const removeReseller = api(
    { expose: true, method: "PATCH", path: "/reseller/remove/:regNo" },
    async ({ regNo }: { regNo: number }): Promise<SuccessResellerRemovedResponse> => {
        // try {
        await ResellerService.removeReseller(regNo);
        return { success: true, message: "User is no longer a reseller." };
        // } catch (error) {
        //     throw APIError.unknown(error?.toString() || "Error removing user from reseller.");
        // }
    }
);

// API to list all resellers
export const listResellers = api(
    { expose: true, method: "GET", path: "/reseller/list" },
    async (): Promise<SuccessResellersListResponse> => {
        // try {
        const resellers = await ResellerService.listResellers();
        return { success: true, data: resellers };
        // } catch (error) {
        //     throw APIError.unknown(error?.toString() || "Error fetching resellers.");
        // }
    }
);
// API to transfer diamonds
export const transferDiamonds = api(
    { expose: true, method: "POST", path: "/reseller/transfer" },
    async ({ senderId, receiverId, diamond }: ResellerTransferDiamondDto): Promise<SuccessResellerTransferDiamondResponse
    > => {
        // try {
        const transfer = await ResellerService.transferDiamonds(senderId, receiverId, diamond);
        return { success: true, data: transfer };
        // } catch (error) {
        //     throw APIError.unknown(error?.toString() || "Error transferring diamonds.");
        // }
    }
);

// API to list reseller transaction history
export const listResellerHistory = api(
    { expose: true, method: "GET", path: "/reseller/history/:resellerId" },
    async ({ resellerId }: { resellerId: string }): Promise<SuccessResellerTransferHistoryListResponse> => {
        // try {
        const history = await ResellerService.getResellerHistory(resellerId);
        return { success: true, data: history };
        // } catch (error) {
        //     throw APIError.unknown(error?.toString() || "Error fetching reseller history.");
        // }
    }
);