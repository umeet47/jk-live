import { api } from "encore.dev/api";
import DiamondHistoryService from "./diamond-history.service";
import { DiamondMetricsResponse } from "./diamond-history.interface";

// API to get diamond metrics
export const getDiamondMetrics = api(
    { expose: true, method: "GET", path: "/diamond/metrics" },
    async (): Promise<DiamondMetricsResponse> => {
        const metrics = await DiamondHistoryService.getDiamondMetrics();
        return { success: true, data: metrics };
    }
);

// API to get diamond metrics
export const resetDiamondMetrics = api(
    { expose: true, method: "DELETE", path: "/diamond/metrics/reset" },
    async (): Promise<{success: true}> => {
        await DiamondHistoryService.resetDiamondMetrics();
        return { success: true };
    }
);