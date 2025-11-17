import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { CreateGiftDto, ISuccessGift, ISuccessGifts, UpdateGiftDto } from "./gift.interface";
import GiftService from "./gift.service";

// Create a new gift
export const createGift = api(
    { expose: true, auth: true, method: "POST", path: "/gifts" },
    async (data: CreateGiftDto): Promise<ISuccessGift> => {
        const role = getAuthData()!.role
        if (role !== "ADMIN") {
            throw APIError.permissionDenied("Only Admin is allowed")
        }
        const gift = await GiftService.createGift(data);
        return { success: true, data: gift };
    }
);

// Update an existing gift
export const updateGift = api(
    { expose: true, auth: true, method: "PUT", path: "/gifts/:id" },
    async (data: UpdateGiftDto): Promise<ISuccessGift> => {
        const role = getAuthData()!.role
        if (role !== "ADMIN") {
            throw APIError.permissionDenied("Only Admin is allowed")
        }
        const gift = await GiftService.updateGift(data);
        return { success: true, data: gift };
    }
);

// Delete a gift
export const deleteGift = api(
    { expose: true, auth: true, method: "DELETE", path: "/gifts/:id" },
    async ({ id }: { id: string }): Promise<{ success: boolean; message: string }> => {
        const role = getAuthData()!.role
        if (role !== "ADMIN") {
            throw APIError.permissionDenied("Only Admin is allowed")
        }
        await GiftService.deleteGift(id);
        return { success: true, message: "Gift deleted successfully" };
    }
);

// List all gifts
export const listGifts = api(
    { expose: true, auth: true, method: "GET", path: "/gifts" },
    async (): Promise<ISuccessGifts> => {
        const gifts = await GiftService.listGifts();
        return {
            success: true,
            data: gifts,
        };
    }
);