import { APIError } from "encore.dev/api";
import { prisma } from "../../common/database";
import { HostRequestDto } from "./host.interface";
import { getSocketInstance } from "../realtime/socket.service";
import { REAL_UPDATE } from "../../common/enum";

const HostRepository = {
    createHostRequest: async (data: HostRequestDto) => {
        return prisma.hostRequest.create({
            data,
            include: {
                user: {
                    include: {
                        ActivePackage: true,
                        ActiveAnimation: true,
                        ActiveProfileFrame: true
                    }
                }
            }
        });
    },
    rejectedHostRequest: async (requestId: string) => {
        return prisma.hostRequest.update({
            where: { id: requestId },
            data: { status: "rejected" },
            include: {
                user: {
                    include: {
                        ActivePackage: true,
                        ActiveAnimation: true,
                        ActiveProfileFrame: true
                    }
                }
            }
        });
    },
    acceptedHostRequest: async (requestId: string) => {
        return prisma.hostRequest.update({
            where: { id: requestId },
            data: {
                status: "accepted",
                user: {
                    update: {
                        data: { isDiamondBlocked: true, isHost: true }
                    }
                }
            },
            include: {
                user: {
                    include: {
                        ActivePackage: true,
                        ActiveAnimation: true,
                        ActiveProfileFrame: true
                    }
                }
            }
        });
    },

    findHostRequestById: async (requestId: string) => {
        return prisma.hostRequest.findUnique({
            where: { id: requestId },
        });
    },

    findByAgentAndUserId: async (agentId: string, userId: string) => {
        return prisma.hostRequest.findFirst({
            where: { agentId, userId }
        })
    },

    removeHostRequest: async (id: string, userId: string) => {
        try {
            return await prisma.$transaction(async (tx) => {
                await tx.hostRequest.delete({ where: { id } })
                const user = await tx.user.update({ where: { id: userId }, data: { isDiamondBlocked: false, isHost: false } })
                const io = getSocketInstance();
                io.emit(REAL_UPDATE.USER_UPDATED, { user });
                return user
            });
        } catch (error: unknown) {
            throw APIError.unknown(`Failed to remove host request and update diamond blocked flag: ${error}`);
        }
    },

    findPendingHostRequest: async () => {
        return prisma.hostRequest.findMany({
            where: { status: "pending" },
            include: {
                user: {
                    include: {
                        ActivePackage: true,
                        ActiveAnimation: true,
                        ActiveProfileFrame: true
                    }
                },
            }
        })
    },
    findAcceptedHostRequest: async () => {
        return prisma.hostRequest.findMany({
            where: { status: "accepted" },
            include: {
                user: {
                    include: {
                        ActivePackage: true,
                        ActiveAnimation: true,
                        ActiveProfileFrame: true
                    }
                },
            }
        })
    },
    fetchAllAcceptedRequestByAgentId: async (agentId: string) => {
        return prisma.hostRequest.findMany({
            where: { status: "accepted", agentId },
            include: {
                user: {
                    include: {
                        ActivePackage: true,
                        ActiveAnimation: true,
                        ActiveProfileFrame: true
                    }
                },
            }
        })
    },
    findByUserId: async (userId: string) => {
        return prisma.hostRequest.findFirst({
            where: { userId },
            orderBy: {
                createdAt: "desc", // Sort by creation date in descending order
            },
            include: {
                user: {
                    include: {
                        ActivePackage: true,
                        ActiveAnimation: true,
                        ActiveProfileFrame: true
                    }
                },
            }
        });
    }
};

export default HostRepository;