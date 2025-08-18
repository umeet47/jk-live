import { prisma } from "../../common/database";

const AgentRepository = {
    makeAgent: async (userId: string) => {
        return prisma.user.update({
            where: { id: userId },
            data: { isAgent: true },
        });
    },

    removeAgent: async (userId: string) => {
        return prisma.user.update({
            where: { id: userId },
            data: { isAgent: false },
        });
    },

    getUserIdByRegNo: async (regNo: number) => {
        return prisma.user.findFirst({
            where: { regNumber: regNo },
            select: { id: true },
        });
    },

    listAgents: async () => {
        return prisma.user.findMany({
            where: { isAgent: true },
            include: { ActivePackage: true, ActiveAnimation: true, ActiveProfileFrame: true }
        });
    },

    // List agents with total diamond count of their hosts
    listAgentsWithHostDiamond: async () => {
        return prisma.user.findMany({
            where: { isAgent: true },
            include: {
                ActivePackage: true,
                ActiveAnimation: true,
                ActiveProfileFrame: true,
                HostRequestAgent: {
                    where: { status: "accepted" }, // Only include accepted hosts
                    include: {
                        user: {
                            select: { diamond: true }, // Select the diamond count of each host
                        },
                    },
                },
            },
        });
    },
    // List agents with total diamond count of their hosts only
    listAgentsWithHostDiamondOnly: async () => {
        return prisma.user.findMany({
            where: { isAgent: true },
            select: {
                id: true,
                HostRequestAgent: {
                    where: { status: "accepted" }, // Only include accepted hosts
                    select: {
                        user: {
                            select: { diamond: true }, // Select the diamond count of each host
                        },
                    },
                },
            },
        });
    },
};

export default AgentRepository;