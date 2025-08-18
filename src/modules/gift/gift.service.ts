import GiftRepository from "./gift.repository";
import { CreateGiftDto, UpdateGiftDto } from "./gift.interface";
import { APIError } from "encore.dev/api";

const GiftService = {
    createGift: async (data: CreateGiftDto) => {
        return GiftRepository.create(data);
    },

    updateGift: async (data: UpdateGiftDto) => {
        const gift = await GiftRepository.findById(data.id);
        if (!gift) {
            throw APIError.notFound("Gift not found");
        }
        return GiftRepository.update(data);
    },

    deleteGift: async (id: string) => {
        const gift = await GiftRepository.findById(id);
        if (!gift) {
            throw APIError.notFound("Gift not found");
        }
        return GiftRepository.delete(id);
    },

    listGifts: async () => {
        return GiftRepository.findAll();
    },
};

export default GiftService;