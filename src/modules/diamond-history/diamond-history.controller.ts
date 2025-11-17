import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { DiamondMetricsResponse } from "./diamond-history.interface";
import DiamondHistoryService from "./diamond-history.service";

// API to get diamond metrics
export const getDiamondMetrics = api(
    { expose: true, auth: true, method: "GET", path: "/diamond/metrics" },
    async (): Promise<DiamondMetricsResponse> => {
        const role = getAuthData()!.role
        if (role !== "ADMIN") {
            throw APIError.permissionDenied("Only Admin is allowed")
        }
        const metrics = await DiamondHistoryService.getDiamondMetrics();
        return { success: true, data: metrics };
    }
);

// API to get diamond metrics
export const resetDiamondMetrics = api(
    { expose: true, auth: true, method: "DELETE", path: "/diamond/metrics/reset" },
    async (): Promise<{ success: true }> => {
        const role = getAuthData()!.role
        if (role !== "ADMIN") {
            throw APIError.permissionDenied("Only Admin is allowed")
        }
        await DiamondHistoryService.resetDiamondMetrics();
        return { success: true };
    }
);