import GiftService from "./gift.service";
import { CreateGiftDto, ISuccessGift, ISuccessGifts, UpdateGiftDto } from "./gift.interface";
import { api } from "encore.dev/api";

// Create a new gift
export const createGift = api(
    { expose: true, method: "POST", path: "/gifts" },
    async (data: CreateGiftDto): Promise<ISuccessGift> => {
        const gift = await GiftService.createGift(data);
        return { success: true, data: gift };
    }
);

// Update an existing gift
export const updateGift = api(
    { expose: true, method: "PUT", path: "/gifts/:id" },
    async (data: UpdateGiftDto): Promise<ISuccessGift> => {
        const gift = await GiftService.updateGift(data);
        return { success: true, data: gift };
    }
);

// Delete a gift
export const deleteGift = api(
    { expose: true, method: "DELETE", path: "/gifts/:id" },
    async ({ id }: { id: string }): Promise<{ success: boolean; message: string }> => {
        await GiftService.deleteGift(id);
        return { success: true, message: "Gift deleted successfully" };
    }
);

// List all gifts
export const listGifts = api(
    { expose: true, method: "GET", path: "/gifts" },
    async (): Promise<ISuccessGifts> => {
        const gifts = await GiftService.listGifts();
        return {
            success: true,
            data: gifts,
        };
    }
);