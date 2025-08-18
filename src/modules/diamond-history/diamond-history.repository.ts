import { prisma } from "../../common/database";

const DiamondHistoryRepository = {
    // Get total diamonds sent and received
    getTotalDiamonds: async (type: "add" | "remove") => {
        return prisma.diamondHistory.aggregate({
            where: { type },
            _sum: { diamond: true },
        });
    },

    // Get total diamonds sent and received today
    getTotalDiamondsToday: async (type: "add" | "remove") => {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        return prisma.diamondHistory.aggregate({
            where: {
                type,
                createdAt: { gte: startOfDay },
            },
            _sum: { diamond: true },
        });
    },

    // Get total bonus diamonds
    getTotalBonusDiamonds: async () => {
        return prisma.giftHistory.aggregate({
            _sum: { diamondBonus: true },
        });
    },

    // Get total bonus diamonds today
    getTotalBonusDiamondsToday: async () => {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        return prisma.giftHistory.aggregate({
            where: {
                createdAt: { gte: startOfDay },
            },
            _sum: { diamondBonus: true },
        });
    },
    resetDiamondMetrics: async () => {
        try {
            return prisma.$transaction(async (tx) => {
                await tx.diamondHistory.deleteMany();
                await tx.giftHistory.deleteMany();
            })
        } catch (error) {
            console.error("Error resetting diamond metrics:", error);
            throw new Error("Failed to reset diamond metrics");
        }
    },
};

export default DiamondHistoryRepository;