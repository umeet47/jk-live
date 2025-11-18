import { api } from "encore.dev/api";
import { SystemSettingResponse, UpdateSystemSetting } from "./system-setting.interface";
import SystemSettingService from "./system-setting.service";

/**
 * Fetch System setting data
 */
export const fetchSystemSetting = api(
    { expose: true, auth: true, method: "GET", path: "/system-setting" },
    async (): Promise<SystemSettingResponse> => {
        const data = await SystemSettingService.getSystemSetting();
        return { success: true, message: "Fetch System Setting successfully", data };
    }
);

/**
 * Update System setting data
 */
export const updateSystemSetting = api(
    { expose: true, auth: true, method: "PATCH", path: "/system-setting" },
    async (data: UpdateSystemSetting): Promise<SystemSettingResponse> => {
        const result = await SystemSettingService.updateSystemSetting(data);
        return { success: true, message: "Update System Setting successfully", data: result };
    }
);