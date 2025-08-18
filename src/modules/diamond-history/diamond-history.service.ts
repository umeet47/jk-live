import DiamondHistoryRepository from "./diamond-history.repository";

const DiamondHistoryService = {
    // Get all diamond-related metrics
    getDiamondMetrics: async () => {
        // Total diamonds sent
        const totalSent = await DiamondHistoryRepository.getTotalDiamonds("add");
        const totalSentToday = await DiamondHistoryRepository.getTotalDiamondsToday("add");

        // Total diamonds received
        const totalReceived = await DiamondHistoryRepository.getTotalDiamonds("remove");
        const totalReceivedToday = await DiamondHistoryRepository.getTotalDiamondsToday("remove");

        // Total bonus diamonds
        const totalBonus = await DiamondHistoryRepository.getTotalBonusDiamonds();
        const totalBonusToday = await DiamondHistoryRepository.getTotalBonusDiamondsToday();

        return {
            totalSent: totalSent._sum.diamond || 0,
            totalSentToday: totalSentToday._sum.diamond || 0,
            totalReceived: totalReceived._sum.diamond || 0,
            totalReceivedToday: totalReceivedToday._sum.diamond || 0,
            totalBonus: totalBonus._sum.diamondBonus || 0,
            totalBonusToday: totalBonusToday._sum.diamondBonus || 0,
        };
    },
    resetDiamondMetrics: async () => {
        // Reset all diamond-related metrics
        return DiamondHistoryRepository.resetDiamondMetrics();
    }
};

export default DiamondHistoryService;