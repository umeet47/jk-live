import DiamondSendPercentageRepository from "./diamond-send-percentage.repository";
import { APIError } from "encore.dev/api";
import { UpdateDiamondSendPercentageDto } from "./diamond-send-percentage.interface";

const DiamondSendPercentageService = {
    findOne: async () => {
        const result = await DiamondSendPercentageRepository.findFirst();
        if (!result) {
            throw APIError.notFound("Diamond send percentage not found.");
        }
        const percentage = Number(result.percentage);
        return {
            id: result.id,
            percentage: percentage,
            subtractFrom: result.subtractFrom,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt
        }
    },
    update: async ({ id, ...data }: UpdateDiamondSendPercentageDto) => {
        const existing = await DiamondSendPercentageRepository.findById(id);
        if (!existing) {
            throw APIError.aborted("Diamond send percentage does not exist.");
        }
        const result = await DiamondSendPercentageRepository.update({ id: existing.id }, data);
        const percentage = Number(result.percentage);
        return {
            id: result.id,
            percentage: percentage,
            subtractFrom: result.subtractFrom,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt
        }
    }
};

export default DiamondSendPercentageService;
