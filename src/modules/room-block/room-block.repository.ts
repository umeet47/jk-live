import { prisma } from "../../common/database";

const RoomBlockRepository = {
    findByBlockerId: async (blockerId: string) => {
        return prisma.roomBlock.findMany({
            where: { blockerId },
            include: {
                blocked: {
                    include: {
                        ActiveAnimation: true,
                        ActivePackage: true,
                        ActiveProfileFrame: true,
                    }
                }, // Assuming you want to fetch the blocked user details
            }
        });
    },
    blockUser: async (blockerId: string, blockedId: string) => {
        return prisma.roomBlock.create({
            data: {
                blockerId,
                blockedId,
            },
        });
    },
    unblockUser: async (blockerId: string, blockedId: string) => {
        return prisma.roomBlock.deleteMany({
            where: {
                blockerId,
                blockedId,
            },
        });
    },
    findByBlockerAndBlocked: async (blockerId: string, blockedId: string) => {
        return prisma.roomBlock.findFirst({
            where: {
                blockerId,
                blockedId,
            },
        });
    },
};
export default RoomBlockRepository;
