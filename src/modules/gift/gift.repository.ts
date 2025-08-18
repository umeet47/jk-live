import { prisma } from "../../common/database";
import { CreateGiftDto, UpdateGiftDto } from "./gift.interface";

const GiftRepository = {
    create: async (data: CreateGiftDto) => {
        return prisma.gift.create({
            data,
        });
    },

    update: async (data: UpdateGiftDto) => {
        const { id, ...updateData } = data;
        return prisma.gift.update({
            where: { id },
            data: updateData,
        });
    },

    delete: async (id: string) => {
        return prisma.gift.delete({
            where: { id },
        });
    },

    findAll: async () => {
        return prisma.gift.findMany({
            orderBy: { amount: "asc" },
        });
    },

    findById: async (id: string) => {
        return prisma.gift.findUnique({
            where: { id },
        });
    },
};

export default GiftRepository;