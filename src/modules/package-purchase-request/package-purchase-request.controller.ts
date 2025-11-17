import { api } from "encore.dev/api";
import { AllPackagePurchaseRequestListResponse, CreatePackagePurchaseRequestDto, PackagePurchaseRequestResponse } from "./package-purchase-request.interface";
import PackagePurchaseRequestService from "./package-purchase-request.service";

// Create a new PackagePurchaseRequest
export const createPackagePurchaseRequest = api(
    { expose: true, auth: true, method: "POST", path: "/package-purchase-request" },
    async (data: CreatePackagePurchaseRequestDto): Promise<PackagePurchaseRequestResponse> => {
        const result = await PackagePurchaseRequestService.createRequest(data);
        return { success: true, result };
    }
);

// Update the status of a PackagePurchaseRequest
export const updatePackagePurchaseRequestStatus = api(
    { expose: true, auth: true, method: "PATCH", path: "/package-purchase-request/status" },
    async ({ id, status }: { id: string; status: string }): Promise<PackagePurchaseRequestResponse> => {
        await PackagePurchaseRequestService.updateRequestStatus(id, status);
        return { success: true };
    }
);

export const fetchAllPackagePurchaseRequest = api(
    { expose: true, auth: true, method: "GET", path: "/package-purchase-request/all/list" },
    async (): Promise<AllPackagePurchaseRequestListResponse> => {
        const data = await PackagePurchaseRequestService.fetchAllPackagePurchaseRequest();
        return { success: true, data };
    }
);