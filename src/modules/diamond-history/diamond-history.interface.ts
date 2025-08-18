export interface DiamondMetricsResponse {
    success: boolean;
    data: {
        totalSent: number;
        totalSentToday: number;
        totalReceived: number;
        totalReceivedToday: number;
        totalBonus: number;
        totalBonusToday: number;
    }
}