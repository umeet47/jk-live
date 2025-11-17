import { api } from "encore.dev/api";
import { SuccessAllLiveStreamParticipant, SuccessAllLiveStreamParticipantDuration, SuccessLiveStreamParticipantDurationForGivenParticipant, SuccessLiveStreamParticipantForGivenParticipant } from "./livestream-participant.interface";
import LiveStreamParticipantService from "./livestream-participant.service";

// Get all live stream durations
export const getAllLiveStreamsDurationPerDay = api(
    { expose: true, auth: true, method: "GET", path: "/livestream-participant/all/duration/list" },
    async (): Promise<SuccessAllLiveStreamParticipantDuration> => {
        const streams = await LiveStreamParticipantService.getAllLiveStreamsDurationPerDay();
        return { success: true, data: streams };
    }
);

// Get all live streams
export const getAllLiveStreams = api(
    { expose: true, auth: true, method: "GET", path: "/livestream-participant/all/list" },
    async (): Promise<SuccessAllLiveStreamParticipant> => {
        const streams = await LiveStreamParticipantService.getAllLiveStreams();
        return { success: true, data: streams };
    }
);

// Get live streams duration for given participant
export const getLiveStreamsDurationPerDayForGivenParticipant = api(
    { expose: true, auth: true, method: "GET", path: "/livestream-participant/duration/:participantId" },
    async ({ participantId }: { participantId: string }): Promise<SuccessLiveStreamParticipantDurationForGivenParticipant> => {
        const streams = await LiveStreamParticipantService.getLiveStreamsDurationPerDayForGivenParticipant(participantId);
        return { success: true, data: streams };
    }
);

// Get live streams for given participant
export const getLiveStreamsForGivenParticipant = api(
    { expose: true, auth: true, method: "GET", path: "/livestream-participant/:participantId" },
    async ({ participantId }: { participantId: string }): Promise<SuccessLiveStreamParticipantForGivenParticipant> => {
        const streams = await LiveStreamParticipantService.getLiveStreamsForGivenParticipant(participantId);
        return { success: true, data: streams };
    }
);