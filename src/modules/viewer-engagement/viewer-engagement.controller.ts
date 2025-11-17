import { api } from "encore.dev/api";
import { SuccessAllViewerEngagement, SuccessAllViewerEngagementDuration, SuccessAllViewerEngagementDurationForGivenViewer, SuccessAllViewerEngagementForGivenViewer } from "./viewer-engagement.interface";
import ViewerEngagementService from "./viewer-engagement.service";

// Get all viewer engagement duration for given viewer
export const getAllViewerEngagementDurationPerDayForGivenViewer = api(
    { expose: true, auth: true, method: "GET", path: "/viewer-engagement/duration/:viewerId" },
    async ({ viewerId }: { viewerId: string }): Promise<SuccessAllViewerEngagementDurationForGivenViewer> => {
        const data = await ViewerEngagementService.getAllViewerEngagementsDurationPerDayForGivenViewer(viewerId);
        return { success: true, data };
    }
);

// Get all viewer engagement records for given viewer
export const getAllViewerEngagementsForGivenViewer = api(
    { expose: true, auth: true, method: "GET", path: "/viewer-engagement/:viewerId" },
    async ({ viewerId }: { viewerId: string }): Promise<SuccessAllViewerEngagementForGivenViewer> => {
        const data = await ViewerEngagementService.getAllViewerEngagementsForGivenViewer(viewerId);
        return { success: true, data };
    }
);

// Get all viewer engagement duration of all viewer with role
export const getAllViewerEngagementDurationPerDay = api(
    { expose: true, auth: true, method: "GET", path: "/viewer-engagement/all/duration/list" },
    async (): Promise<SuccessAllViewerEngagementDuration> => {
        const data = await ViewerEngagementService.getAllViewerEngagementsDurationPerDay();
        return { success: true, data };
    }
);

// Get all viewer engagement records of all viewer
export const getAllViewerEngagements = api(
    { expose: true, auth: true, method: "GET", path: "/viewer-engagement/all/list" },
    async (): Promise<SuccessAllViewerEngagement> => {
        const data = await ViewerEngagementService.getAllViewerEngagements();
        return { success: true, data };
    }
);