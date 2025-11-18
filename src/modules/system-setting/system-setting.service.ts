import { Prisma } from "@prisma/client";
import { APIError } from "encore.dev/api";
import SystemSettingRepository from "./system-setting.repository";
import { getSocketInstance } from "../realtime/socket.service";
import { REAL_UPDATE } from "../../common/enum";

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
        const result = await SystemSettingRepository.updateSystemSetting(systemSetting.id, data)
        const io = getSocketInstance();
        io.emit(REAL_UPDATE.SYSTEM_SETTING, result);

        return result
    }
}

export default SystemSettingService;