import { Prisma } from "@prisma/client";
import { APIError } from "encore.dev/api";
import SystemSettingRepository from "./system-setting.repository";

const SystemSettingService = {
    getSystemSetting: async () => {
        const systemSetting = await SystemSettingRepository.getSystemSetting()
        if (!systemSetting) {
            throw APIError.notFound("System setting not found");
        }
        return systemSetting
    },
    updateSystemSetting: async (data: Prisma.SystemSettingUncheckedUpdateInput) => {
        const systemSetting = await SystemSettingRepository.getSystemSetting()
        if (!systemSetting) {
            throw APIError.notFound("System setting not found");
        }
        return SystemSettingRepository.updateSystemSetting(systemSetting.id, data)
    }
}

export default SystemSettingService;