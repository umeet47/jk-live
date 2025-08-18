import { api } from "encore.dev/api";
import LiveStreamService from "./livestream.service";
import {
    SuccessAllLiveStream,
    SuccessAllLiveStreamDuration,
    SuccessDailyStream
} from "./livestream.interface";
import { UserWithTotalDuration } from "../users/user.interface";

// RESET LIVESTREAM DATA BY SUPER ADMIN
export const resetLiveStreamData = api(
    { expose: true, method: "GET", path: "/livestream/all/reset" },
    async ({ endDate }: { endDate?: string }): Promise<{ success: boolean }> => {
        await LiveStreamService.resetLiveStreamData(endDate);
        return { success: true };
    }
);

// Get top 5 host live streamer list
export const getAll = api(
    { expose: true, method: "GET", path: "/livestream" },
    async (): Promise<{ success: boolean, data: any }> => {
        const data = await LiveStreamService.getAll();
        return { success: true, data };
    }
);

// Get daily stream duration
export const getDailyStreamDuration = api(
    { expose: true, method: "GET", path: "/livestream/duration/:hostId/:date" },
    async ({ hostId, date }: { hostId: string; date: string }): Promise<SuccessDailyStream> => {
        const duration = await LiveStreamService.getDailyStreamDuration(hostId, new Date(date));
        return { success: true, data: { duration } };
    }
);

// Get all live streams
export const getAllLiveStreamsDurationPerDay = api(
    { expose: true, method: "GET", path: "/livestream/all/duration/:hostId" },
    async ({ hostId }: { hostId: string }): Promise<SuccessAllLiveStreamDuration> => {
        const streams = await LiveStreamService.getAllLiveStreamsDurationPerDay(hostId);
        return { success: true, data: streams };
    }
);


// Get daily stream
export const getDailyStream = api(
    { expose: true, method: "GET", path: "/livestream/:hostId/:date" },
    async ({ hostId, date }: { hostId: string; date: string }): Promise<SuccessAllLiveStream> => {
        const streams = await LiveStreamService.getDailyStream(hostId, new Date(date));
        return { success: true, data: streams };
    }
);

// Get all live streams
export const getAllLiveStreams = api(
    { expose: true, method: "GET", path: "/livestream/all/:hostId" },
    async ({ hostId }: { hostId: string }): Promise<SuccessAllLiveStream> => {
        const streams = await LiveStreamService.getAllLiveStreams(hostId);
        return { success: true, data: streams };
    }
);

export interface SuccessTopFiveStreamer {
    success: boolean;
    data: UserWithTotalDuration[];
}

// Get top 5 host live streamer list
export const getTopFiveHostLiveStreamer = api(
    { expose: true, method: "GET", path: "/livestream/top-five" },
    async (): Promise<SuccessTopFiveStreamer> => {
        const data = await LiveStreamService.getTopFiveHostLiveStreamer();
        return { success: true, data };
    }
);



// API to calculate total producer time for a live stream
export const getTotalProducerTime = api(
    { expose: true, method: "GET", path: "/livestream/producer-time/:liveStreamId" },
    async ({ liveStreamId }: { liveStreamId: string }): Promise<{ success: boolean; totalProducerTime: number }> => {
        const totalProducerTime = await LiveStreamService.calculateTotalProducerTime(liveStreamId);
        return { success: true, totalProducerTime };
    }
);

// API to calculate total producer time for a specific duration
export const getTotalProducerTimeForDuration = api(
    { expose: true, method: "GET", path: "/livestream/producer-time/duration" },
    async ({ startDate, endDate }: { startDate: string; endDate: string }): Promise<{ success: boolean; totalProducerTime: number }> => {
        const totalProducerTime = await LiveStreamService.calculateTotalProducerTimeForDuration(new Date(startDate), new Date(endDate));
        return { success: true, totalProducerTime };
    }
);

// API to calculate total consuming time for a participant
export const getTotalConsumingTime = api(
    { expose: true, method: "GET", path: "/livestream/consuming-time/:liveStreamId/:userId" },
    async ({ liveStreamId, userId }: { liveStreamId: string; userId: string }): Promise<{ success: boolean; totalConsumingTime: number }> => {
        const totalConsumingTime = await LiveStreamService.calculateTotalConsumingTime(liveStreamId, userId);
        return { success: true, totalConsumingTime };
    }
);

// API to calculate total consuming time for a participant
export const getAllProducerActivity = api(
    { expose: true, method: "GET", path: "/livestream/producer-activity" },
    async (): Promise<{ success: boolean; data: any[] }> => {
        const data = await LiveStreamService.getAllProducerActivity();
        return { success: true, data };
    }
);

export const getAllLiveStreamParticipants = api(
    { expose: true, method: "GET", path: "/livestream/participant-activity" },
    async (): Promise<{ success: boolean; data: any[] }> => {
        const data = await LiveStreamService.getAllLiveStreamParticipants();
        return { success: true, data };
    }
);

//total time taken till now by a user
export const getTotalDurationByUserId = api(
    { expose: true, method: "GET", path: "/livestream/total-duration/:userId" },
    async ({ userId }: { userId: string }): Promise<{
        success: boolean; data: {
            totalSeconds: number
            formattedDuration: string
        }
    }> => {
        const data = await LiveStreamService.getTotalDurationByUserId(userId);
        return { success: true, data };
    }
);

//main api
//total time taken till now by a user
export const getTotalDuration = api(
    { expose: true, method: "GET", path: "/livestream/total-duration" },
    async (): Promise<{
        success: boolean; data: {
            totalSeconds: number
            formattedDuration: string
        }
    }> => {
        const data = await LiveStreamService.getTotalDuration();
        return { success: true, data };
    }
);

//IMPORTANT: This API is used to get the total producer and participant activity for all rooms
//Total time taken raw 
export const getTotalProducerAndParticipantActivity = api(
    { expose: true, method: "GET", path: "/livestream/producer/participant-activity" },
    async (): Promise<{ success: boolean; data: any }> => {
        const data = await LiveStreamService.getTotalProducerAndParticipantActivity();
        return { success: true, data };
    }
);

//IMPORTANT: This API is used to get the total producer and participant activity for all rooms
//Total time taken raw  for given roomId
export const getTotalProducerAndParticipantActivityForRoomId = api(
    { expose: true, method: "GET", path: "/livestream/producer/participant-activity/:roomId" },
    async ({ roomId }: { roomId: string }): Promise<{
        success: boolean; data: any
    }> => {
        const data = await LiveStreamService.getTotalProducerAndParticipantActivityForRoomId(roomId);
        return { success: true, data };
    }
);

// do not use this api 
//Total time taken duration  for given roomId
export const fetchTotalTimeUsed = api(
    { expose: true, method: "GET", path: "/livestream/total/time-taken" },
    async (): Promise<{
        success: boolean; data: any[]
    }> => {
        const data = await LiveStreamService.fetchTotalTimeUsed();
        return { success: true, data };
    }
);

export const deleteAllLiveStreamProducerData = api(
    { expose: true, method: "GET", path: "/livestream/remove" },
    async (): Promise<{
        success: boolean;
    }> => {
        await LiveStreamService.deleteAllLiveStreamProducerData();
        return { success: true };
    }
);

// total roomIds created 
export const getTotalRoomIds = api(
    { expose: true, method: "GET", path: "/livestream/total/room-ids" },
    async (): Promise<{
        success: boolean; data: string[], totalCount: number
    }> => {
        const { data, totalCount } = await LiveStreamService.getTotalRoomIds();
        return { success: true, data, totalCount };
    }
);

// total live streams created
export const getTotalLiveStreams = api(
    { expose: true, method: "GET", path: "/livestream/total/created" },
    async (): Promise<{
        success: boolean; data: { id: string; startTime: Date; endTime: Date | null, totalTime: number }[], totalCount: number
    }> => {
        const { data, totalCount } = await LiveStreamService.getTotalLiveStreams();
        return { success: true, data, totalCount };
    }
);
