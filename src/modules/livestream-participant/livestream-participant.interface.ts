export interface LiveStreamParticipant {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    liveStreamId: string;
    roomId: string;
    startTime: Date;
    endTime: Date | null;
}

export interface SuccessAllLiveStreamParticipantDuration {
    success: boolean;
    data: {
        date: string;
        totalTimeDuration: string;
        role: string;
        userId: string;
    }[];
}

export interface SuccessAllLiveStreamParticipant {
    success: boolean;
    data: LiveStreamParticipant[];
}
export interface SuccessLiveStreamParticipantDurationForGivenParticipant {
    success: boolean;
    data: {
        date: string;
        totalTimeDuration: string;
        role: string;
    }[];
}

export interface SuccessLiveStreamParticipantForGivenParticipant {
    success: boolean;
    data: LiveStreamParticipant[];
}

export interface CreateLiveStreamParticipantDto {
    roomId: string;
    startTime: Date;
    liveStreamId: string;
    role: string;
    userId: string;
}
export interface UpdateLiveStreamParticipantDto {
    roomId: string;
    userId: string;
    liveStreamId: string;
    endTime: Date;
}