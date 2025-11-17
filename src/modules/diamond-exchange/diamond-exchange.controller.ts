import { api } from "encore.dev/api";
import DiamondExchangeService from "./diamond-exchange.service";
import { AddDiamondExchangeDto, AddDiamondExchangeResponse, DiamondExchangeListResponse, RemoveDiamondExchangeResponse } from "./diamond-exchange.interface";

// API to add a new diamond exchange entry
export const addDiamondExchange = api(
    { expose: true, auth: true, method: "POST", path: "/diamond-exchange/add" },
    async ({ diamond, amount }: AddDiamondExchangeDto): Promise<AddDiamondExchangeResponse> => {
        const exchange = await DiamondExchangeService.addDiamondExchange(diamond, amount);
        return { success: true, data: exchange };
    }
);

// API to remove a diamond exchange entry
export const removeDiamondExchange = api(
    { expose: true, auth: true, method: "DELETE", path: "/diamond-exchange/remove/:id" },
    async ({ id }: { id: string }): Promise<RemoveDiamondExchangeResponse> => {
        const exchange = await DiamondExchangeService.removeDiamondExchange(id);
        return { success: true, data: exchange };
    }
);

// API to get all diamond exchange entries
export const getAllDiamondExchanges = api(
    { expose: true, auth: true, method: "GET", path: "/diamond-exchange/list" },
    async (): Promise<DiamondExchangeListResponse> => {
        const exchanges = await DiamondExchangeService.getAllDiamondExchanges();
        return { success: true, data: exchanges };
    }
);