import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { AddDiamondExchangeResponse, DiamondExchangeListResponse, UpdateDiamondExchangeDto } from "./diamond-exchange.interface";
import DiamondExchangeService from "./diamond-exchange.service";

// API to add a new diamond exchange entry
export const updateDiamondExchange = api(
    { expose: true, auth: true, method: "PATCH", path: "/diamond-exchange/update/:id" },
    async (data:   UpdateDiamondExchangeDto): Promise<AddDiamondExchangeResponse> => {
        const role = getAuthData()!.role
        if (role !== "ADMIN") {
            throw APIError.permissionDenied("Only Admin is allowed")
        }
        const exchange = await DiamondExchangeService.updateDiamondExchange(data);
        return { success: true, data: exchange };
    }
);

// // API to add a new diamond exchange entry
// export const addDiamondExchange = api(
//     { expose: true, auth: true, method: "POST", path: "/diamond-exchange/add" },
//     async ({ diamond, amount }: AddDiamondExchangeDto): Promise<AddDiamondExchangeResponse> => {
//         const role = getAuthData()!.role
//         if (role !== "ADMIN") {
//             throw APIError.permissionDenied("Only Admin is allowed")
//         }
//         const exchange = await DiamondExchangeService.addDiamondExchange(diamond, amount);
//         return { success: true, data: exchange };
//     }
// );

// // API to remove a diamond exchange entry
// export const removeDiamondExchange = api(
//     { expose: true, auth: true, method: "DELETE", path: "/diamond-exchange/remove/:id" },
//     async ({ id }: { id: string }): Promise<RemoveDiamondExchangeResponse> => {
//         const role = getAuthData()!.role
//         if (role !== "ADMIN") {
//             throw APIError.permissionDenied("Only Admin is allowed")
//         }
//         const exchange = await DiamondExchangeService.removeDiamondExchange(id);
//         return { success: true, data: exchange };
//     }
// );

// API to get all diamond exchange entries
export const getAllDiamondExchanges = api(
    { expose: true, auth: true, method: "GET", path: "/diamond-exchange/list" },
    async (): Promise<DiamondExchangeListResponse> => {
        const exchanges = await DiamondExchangeService.getAllDiamondExchanges();
        return { success: true, data: exchanges };
    }
);