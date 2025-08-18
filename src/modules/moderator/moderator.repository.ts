import { prisma } from "../../common/database";

const ModeratorRepository = {
    makeModerator: async (userId: string) => {
        return prisma.user.update({
            where: { id: userId },
            data: { isModerator: true },
        });
    },

    removeModerator: async (userId: string) => {
        return prisma.user.update({
            where: { id: userId },
            data: { isModerator: false },
        });
    },

    getUserIdByRegNo: async (regNo: number) => {
        return prisma.user.findFirst({
            where: { regNumber: regNo },
            select: { id: true },
        });
    },

    listModerators: async () => {
        return prisma.user.findMany({
            where: { isModerator: true },
            include: {
                ActivePackage: true,
                ActiveAnimation: true,
                ActiveProfileFrame: true
            }
        });
    },
};

export default ModeratorRepository;