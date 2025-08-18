export interface CreateViewerEngagenementDto {
    userId: string;
    roomId: string;
    startTime: Date;
    liveStreamId: string;
    streamCount: number;
}

export interface UpdateViewerEngagementDto {
    userId: string;
    roomId: string;
    liveStreamId: string;
    endTime: Date;
}


export interface ViewerEngagement {
    id: string;
    userId: string;
    roomId: string;
    liveStreamId: string;
    endTime: Date | null;
    createdAt: Date;
    updatedAt: Date;
    startTime: Date;
    streamCount: number;
}

export interface SuccessAllViewerEngagementDurationForGivenViewer {
    success: boolean;
    data: {
        date: string;
        totalTimeDuration: string;
        userId: string;
    }[];
}

export interface SuccessAllViewerEngagementForGivenViewer {
    success: boolean;
    data: ViewerEngagement[];
}

export interface SuccessAllViewerEngagementDuration {
    success: boolean;
    data: {
        date: string;
        totalTimeDuration: string;
    }[];
}

export interface SuccessAllViewerEngagement {
    success: boolean;
    data: ViewerEngagement[];
}