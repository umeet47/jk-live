import { Prisma, ViewerEngagement } from "@prisma/client";
import { CreateViewerEngagenementDto, UpdateViewerEngagementDto } from "./viewer-engagement.interface";
import ViewerEngagementRepository from "./viewer-engagement.repository";
import { filterStreamsData } from "./viewer-engagement.util";

const ViewerEngagementService = {
    createNewRecord: async (data: CreateViewerEngagenementDto) => {
        return await ViewerEngagementRepository.create(data);
    },
    updateRecord: async ({ userId, roomId, liveStreamId, endTime }: UpdateViewerEngagementDto) => {
        const where: Prisma.ViewerEngagementWhereInput = {
            userId,
            roomId,
            liveStreamId,
            endTime: null,
        }
        return await ViewerEngagementRepository.updateRecord(where, endTime)
    },

    getAllViewerEngagementsDurationPerDay: async () => {
        const streams = await ViewerEngagementRepository.getAllViewerEngagementsDurationPerDay()
        return filterStreamsData(streams)
    },

    getAllViewerEngagements: async () => {
        return await ViewerEngagementRepository.getAllViewerEngagements()
    },

    getAllViewerEngagementsDurationPerDayForGivenViewer: async (viewerId: string) => {
        const streams = await ViewerEngagementRepository.getAllViewerEngagementsDurationPerDayForGivenViewer(viewerId)
        return filterStreamsData(streams)
    },

    getAllViewerEngagementsForGivenViewer: async (viewerId: string) => {
        return await ViewerEngagementRepository.getAllViewerEngagementsForGivenViewer(viewerId)
    },

};
export default ViewerEngagementService;
