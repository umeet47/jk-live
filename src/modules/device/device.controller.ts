import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import DeviceService from "./device.service";

// API to handle device during login
// export const handleDeviceOnLogin = api(
//     { expose: true, auth: true, method: "POST", path: "/devices/login" },
//     async ({ userId, deviceId }: { userId: string; deviceId: string }) => {
//         return await DeviceService.handleDeviceOnLogin(userId, deviceId);
//     }
// );

export interface BlockSuccessResponse {
    success: boolean;
    message: string;
}

export interface UnblockSuccessResponse {
    success: boolean;
    message: string;
}

// API to block a device
export const blockDevice = api(
    { expose: true, auth: true, method: "PATCH", path: "/devices/block/:deviceId" },
    async ({ deviceId }: { deviceId: string }): Promise<BlockSuccessResponse> => {
        const role = getAuthData()!.role
        if (role !== "ADMIN") {
            throw APIError.permissionDenied("Only Admin is allowed")
        }
        return await DeviceService.blockDevice(deviceId);
    }
);

// API to unblock a device
export const unblockDevice = api(
    { expose: true, auth: true, method: "PATCH", path: "/devices/unblock/:deviceId" },
    async ({ deviceId }: { deviceId: string }): Promise<UnblockSuccessResponse> => {
        const role = getAuthData()!.role
        if (role !== "ADMIN") {
            throw APIError.permissionDenied("Only Admin is allowed")
        }
        return await DeviceService.unblockDevice(deviceId);
    }
);
interface DeviceDto {
    deviceId: string;
    id: number;
    createdAt: Date;
    updatedAt: Date;
    isBlocked: boolean;
}

export const getAllDevice = api(
    { expose: true, auth: true, method: "GET", path: "/devices" },
    async (): Promise<{ data: DeviceDto[]; success: boolean }> => {
        const data = await DeviceService.getAllDevices();
        return {
            data, success: true
        }
    }
);

export const getAllBlockedDevices = api(
    { expose: true, auth: true, method: "GET", path: "/devices/block-list" },
    async (): Promise<{ data: DeviceDto[]; success: boolean }> => {
        const data = await DeviceService.getAllBlockedDevices();
        return {
            data, success: true
        }
    }
);