import { Prisma } from "@prisma/client";
import { prisma } from "../../common/database";

const ViewerEngagementRepository = {
    create: async (data: Prisma.ViewerEngagementUncheckedCreateInput) => {
        return prisma.viewerEngagement.create({
            data: {
                userId: data.userId,
                roomId: data.roomId,
                liveStreamId: data.liveStreamId,
                startTime: data.startTime,
                streamCount: data.streamCount,
            },
        });
    },
    updateRecord: async (where: Prisma.ViewerEngagementWhereInput, endTime: Date) => {
        return await prisma.viewerEngagement.updateMany({
            where,
            data: { endTime },
        });
    },

    getAllViewerEngagementsDurationPerDay: async () => {
        return await prisma.viewerEngagement.findMany({
            orderBy: { startTime: "asc" }, // Ensure streams are ordered by start time
        });
    },

    getAllViewerEngagements: async () => {
        return prisma.viewerEngagement.findMany({
            orderBy: { startTime: "desc" },
        });
    },
    getAllViewerEngagementsDurationPerDayForGivenViewer: async (userId: string) => {
        return await prisma.viewerEngagement.findMany({
            where: { userId },
            orderBy: { startTime: "asc" }, // Ensure streams are ordered by start time
        });
    },

    getAllViewerEngagementsForGivenViewer: async (userId: string) => {
        return prisma.viewerEngagement.findMany({
            where: { userId },
            orderBy: { startTime: "desc" },
        });
    },
};
export default ViewerEngagementRepository;
