export interface LiveStream {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    hostId: string;
    type: string;
    isCreatorHost: boolean;
    startTime: Date;
    endTime: Date | null;
}

export interface SuccessDailyStream {
    success: boolean;
    data: {
        duration: number
    };
}

export interface SuccessAllLiveStreamDuration {
    success: boolean;
    data: {
        date: string;
        totalTimeDuration: string;
    }[];
}

export interface SuccessAllLiveStream {
    success: boolean;
    data: LiveStream[];
}

export interface CreateLiveStreamPayload {
    hostId: string;
    isCreatorHost: boolean;
    roomId: string;
    type: string;
    startTime: Date
}


export interface ProducerActivityWithParticipantActivityDto {
   liveStreamId: string;
    userId: string;
    roomId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    startTime: Date;
    type: string;
    endTime: Date | null;
    liveStream: {
         LiveStreamParticipant: {
            liveStreamId: string;
            userId: string;
            roomId: string;
            id: string;
            role: string;
            createdAt: Date;
            updatedAt: Date;
            startTime: Date;
            endTime: Date | null;
        }[];
    }
}