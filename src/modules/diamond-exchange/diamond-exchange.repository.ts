import { Prisma } from "@prisma/client";
import { prisma } from "../../common/database";

const DiamondExchangeRepository = {
    // Add a new diamond exchange entry
    // addDiamondExchange: async (diamond: number, amount: number) => {
    //     return prisma.diamondExchange.create({
    //         data: { diamond, amount },
    //     });
    // },

    getDiamondExchangeByType: async (type: string) => {
        return prisma.diamondExchange.findUnique({
            where: { type },
        });
    },

    getDiamondExchangeById: async (id: string) => {
        return prisma.diamondExchange.findUnique({
            where: { id },
        });
    },

    updateDiamondExchange: async (id: string, data: Prisma.DiamondExchangeUncheckedUpdateInput) => {
        return prisma.diamondExchange.update({
            where: { id },
            data
        });
    },

    // Remove a diamond exchange entry by ID
    removeDiamondExchange: async (id: string) => {
        return prisma.diamondExchange.delete({
            where: { id },
        });
    },

    // Get all diamond exchange entries
    getAllDiamondExchanges: async () => {
        return prisma.diamondExchange.findMany({
            orderBy: { diamond: "asc" },
        });
    },
};

export default DiamondExchangeRepository;