import { Prisma } from "@prisma/client";
import { prisma } from "../../common/database";

const LiveStreamParticipantRepository = {
    getAllLiveStreamsDurationPerDay: async () => {
        return await prisma.liveStreamParticipant.findMany({
            orderBy: { startTime: "asc" }, // Ensure streams are ordered by start time
        });
    },

    getAllLiveStreams: async () => {
        return prisma.liveStreamParticipant.findMany({
            orderBy: { startTime: "desc" },
        });
    },
    getAllLiveStreamsDurationPerDayForGivenParticipant: async (userId: string) => {
        return await prisma.liveStreamParticipant.findMany({
            where: { userId },
            orderBy: { startTime: "asc" }, // Ensure streams are ordered by start time
        });
    },

    getAllLiveStreamsForGivenParticipant: async (userId: string) => {
        return prisma.liveStreamParticipant.findMany({
            where: { userId },
            orderBy: { startTime: "desc" },
        });
    },
    createNewRecord: async (data: Prisma.LiveStreamParticipantUncheckedCreateInput) => {
        return await prisma.liveStreamParticipant.create({ data })
    },
    updateRecord: async (where: Prisma.LiveStreamParticipantWhereInput, endTime: Date) => {
        return await prisma.liveStreamParticipant.updateMany({
            where,
            data: { endTime },
        });
    }
};

export default LiveStreamParticipantRepository;