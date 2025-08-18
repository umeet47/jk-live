import { prisma } from "../../common/database";

const DiamondExchangeRepository = {
    // Add a new diamond exchange entry
    addDiamondExchange: async (diamond: number, amount: number) => {
        return prisma.diamondExchange.create({
            data: { diamond, amount },
        });
    },

    getDiamondExchangeById: async (id: string) => {
        return prisma.diamondExchange.findUnique({
            where: { id },
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