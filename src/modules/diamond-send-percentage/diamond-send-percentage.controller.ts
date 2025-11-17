import { api } from "encore.dev/api";
import { UpdateDiamondSendPercentageDto } from "./diamond-send-percentage.interface";
import DiamondSendPercentageService from "./diamond-send-percentage.service";

export interface IDiamondSendPercentage {
    id: string;
    percentage: number;
    subtractFrom: string;// "sender" | "receiver";
    createdAt: Date;
    updatedAt: Date;
}

// API to add a new diamond exchange entry
export const getDiamondSendPercentage = api(
    { expose: true, auth: true, method: "GET", path: "/diamond-send-percentage" },
    async (): Promise<{ success: boolean; data: IDiamondSendPercentage }> => {
        const exchange = await DiamondSendPercentageService.findOne();
        return { success: true, data: exchange };
    }
);


// API to add a new diamond exchange entry
export const updateDiamondSendPercentage = api(
    { expose: true, auth: true, method: "PATCH", path: "/diamond-send-percentage/update" },
    async (data: UpdateDiamondSendPercentageDto): Promise<{ success: boolean; data: IDiamondSendPercentage }> => {
        const exchange = await DiamondSendPercentageService.update(data);
        return { success: true, data: exchange };
    }
);
