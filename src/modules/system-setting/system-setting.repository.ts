import { Prisma } from "@prisma/client";
import { prisma } from "../../common/database";

const SystemSettingRepository = {
    getSystemSetting: async () => {
        return prisma.systemSetting.findFirst();
    },
    updateSystemSetting: async (id: string, data: Prisma.SystemSettingUncheckedUpdateInput) => {
        return prisma.systemSetting.update({ where: { id }, data })
    }
}

export default SystemSettingRepository;