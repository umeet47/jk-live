import { APIError } from "encore.dev/api";
import DiamondExchangeRepository from "./diamond-exchange.repository";
import { UpdateDiamondExchangeDto } from "./diamond-exchange.interface";

const DiamondExchangeService = {
    getDiamondByType: async (type: string) => {
        const exchange = await DiamondExchangeRepository.getDiamondExchangeById(type);
        if (!exchange) {
            throw APIError.notFound("Diamond exchange entry not found.");
        }
        return exchange;

    },
    updateDiamondExchange: async ({id, ...data}: UpdateDiamondExchangeDto) => {
        const exchange = await DiamondExchangeRepository.getDiamondExchangeById(id);
        if (!exchange) {
            throw APIError.notFound("Diamond exchange entry not found.");
        }
        return await DiamondExchangeRepository.updateDiamondExchange(id, data);
    },
    // Add a new diamond exchange entry
    // addDiamondExchange: async (diamond: number, amount: number) => {
    //     if (diamond <= 0 || amount <= 0) {
    //         throw APIError.aborted("Diamond and amount must be greater than zero.");
    //     }
    //     return await DiamondExchangeRepository.addDiamondExchange(diamond, amount);
    // },

    // Remove a diamond exchange entry by ID
    removeDiamondExchange: async (id: string) => {
        const exchange = await DiamondExchangeRepository.getDiamondExchangeById(id);
        if (!exchange) {
            throw APIError.notFound("Diamond exchange entry not found.");
        }

        return await DiamondExchangeRepository.removeDiamondExchange(id);
    },

    // Get all diamond exchange entries
    getAllDiamondExchanges: async () => {
        return await DiamondExchangeRepository.getAllDiamondExchanges();
    },

    checkExist: async (id: string) => {
        const exchange = await DiamondExchangeRepository.getDiamondExchangeById(id);
        if (!exchange) {
            throw APIError.notFound("Diamond exchange entry not found.");
        }
        return exchange
    }
};

export default DiamondExchangeService;