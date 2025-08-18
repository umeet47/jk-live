import { prisma } from "../../common/database";

const FollowRepository = {
    // Follow a user
    followUser: async (userId: string, targetUserId: string) => {
        return prisma.user.update({
            where: { id: userId },
            data: {
                Following: {
                    connect: { id: targetUserId },
                },
            },
        });
    },

    // Unfollow a user
    unfollowUser: async (userId: string, targetUserId: string) => {
        return prisma.user.update({
            where: { id: userId },
            data: {
                Following: {
                    disconnect: { id: targetUserId },
                },
            },
        });
    },

    // Get the list of users followed by me
    getFollowedUsers: async (userId: string) => {
        return prisma.user.findUnique({
            where: { id: userId },
            include: { Following: { include: { ActivePackage: true, ActiveAnimation: true, ActiveProfileFrame: true } } },
        });
    },

    // Get the list of users following me
    getFollowers: async (userId: string) => {
        return prisma.user.findUnique({
            where: { id: userId },
            include: { Followers: { include: { ActivePackage: true, ActiveAnimation: true, ActiveProfileFrame: true } } },
        });
    },
    checkFollowStatus: async (targetId: string, id: string) => {
        return prisma.user.findFirst({
            where: {
                id,
                Following: {
                    some: { id: targetId },
                },
            },
            select: { id: true }, // Only fetch the ID to minimize data transfer
        });
    }
};

export default FollowRepository;