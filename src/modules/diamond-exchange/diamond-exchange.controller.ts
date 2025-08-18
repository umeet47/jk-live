import { api } from "encore.dev/api";
import DiamondExchangeService from "./diamond-exchange.service";
import { AddDiamondExchangeDto, AddDiamondExchangeResponse, DiamondExchangeListResponse, RemoveDiamondExchangeResponse } from "./diamond-exchange.interface";

// API to add a new diamond exchange entry
export const addDiamondExchange = api(
    { expose: true, method: "POST", path: "/diamond-exchange/add" },
    async ({ diamond, amount }: AddDiamondExchangeDto): Promise<AddDiamondExchangeResponse> => {
        // try {
        const exchange = await DiamondExchangeService.addDiamondExchange(diamond, amount);
        return { success: true, data: exchange };
        // } catch (error) {
        //     throw APIError.unknown(error?.toString() || "Error adding diamond exchange entry.");
        // }
    }
);

// API to remove a diamond exchange entry
export const removeDiamondExchange = api(
    { expose: true, method: "DELETE", path: "/diamond-exchange/remove/:id" },
    async ({ id }: { id: string }): Promise<RemoveDiamondExchangeResponse> => {
        // try {
        const exchange = await DiamondExchangeService.removeDiamondExchange(id);
        return { success: true, data: exchange };
        // } catch (error) {
        //     throw APIError.unknown(error?.toString() || "Error removing diamond exchange entry.");
        // }
    }
);

// API to get all diamond exchange entries
export const getAllDiamondExchanges = api(
    { expose: true, method: "GET", path: "/diamond-exchange/list" },
    async (): Promise<DiamondExchangeListResponse> => {
        // try {s
        const exchanges = await DiamondExchangeService.getAllDiamondExchanges();
        return { success: true, data: exchanges };
        // } catch (error) {
        //     throw APIError.unknown(error?.toString() || "Error fetching diamond exchange entries.");
        // }
    }
);