import { Prisma } from "@prisma/client";
import { CreateLiveStreamParticipantDto, UpdateLiveStreamParticipantDto } from "./livestream-participant.interface";
import LiveStreamParticipantRepository from "./livestream-participant.repository";
import { filterLiveStreamParticipantData } from "./livestream-participant.util";

const LiveStreamParticipantService = {
    getAllLiveStreamsDurationPerDay: async () => {
        const streams = await LiveStreamParticipantRepository.getAllLiveStreamsDurationPerDay();
        return filterLiveStreamParticipantData(streams)
    },
    getAllLiveStreams: async () => {
        return LiveStreamParticipantRepository.getAllLiveStreams();
    },
    getLiveStreamsDurationPerDayForGivenParticipant: async (participantId: string) => {
        const streams = await LiveStreamParticipantRepository.getAllLiveStreamsDurationPerDayForGivenParticipant(participantId);
        return filterLiveStreamParticipantData(streams)
    },
    getLiveStreamsForGivenParticipant: async (participantId: string) => {
        return LiveStreamParticipantRepository.getAllLiveStreamsForGivenParticipant(participantId);
    },
    createNewRecord: async (data: CreateLiveStreamParticipantDto) => {
        return LiveStreamParticipantRepository.createNewRecord(data);
    },
    updateRecord: async ({ endTime, liveStreamId, roomId, userId, }: UpdateLiveStreamParticipantDto) => {
        const where: Prisma.LiveStreamParticipantWhereInput = {
            roomId,
            liveStreamId,
            userId,
            endTime: null
        }
        return LiveStreamParticipantRepository.updateRecord(where, endTime);
    }
};

export default LiveStreamParticipantService;