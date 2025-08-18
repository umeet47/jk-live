import { api } from "encore.dev/api";
import HostService from "./host.service";
import {
    HostRequestDto,
    LeaveAgentDto,
    RemoveFromAgentDto,
    SuccessFetchAllRequest,
    SuccessFetchRequest,
    SuccessRequest,
    UpdateHostRequestDto
} from "./host.interface";

// Create a host request
export const createHostRequest = api(
    { expose: true, method: "POST", path: "/hosts/request" },
    async (data: HostRequestDto): Promise<SuccessRequest> => {
        const request = await HostService.createHostRequest(data);
        return { success: true, data: request };
    }
);

// Update a host request
export const updateHostRequest = api(
    { expose: true, method: "PUT", path: "/hosts/request" },
    async (data: UpdateHostRequestDto): Promise<SuccessRequest> => {
        const updatedRequest = await HostService.updateHostRequest(data.requestId, data.status);
        return { success: true, data: updatedRequest };
    }
);

export const leaveAgent = api(
    { expose: true, method: "PUT", path: "/hosts/leave" },
    async (data: LeaveAgentDto): Promise<{ success: boolean }> => {
        await HostService.leaveAgent(data);
        return { success: true };
    }
);


export const removeFromAgent = api(
    { expose: true, method: "PUT", path: "/hosts/remove" },
    async (data: RemoveFromAgentDto): Promise<{ success: boolean }> => {
        await HostService.removeFromAgent(data);
        return { success: true };
    }
);

// Fetch all pending request
export const fetchAllPendingRequest = api(
    { expose: true, method: "GET", path: "/hosts/request/pending" },
    async (): Promise<SuccessFetchAllRequest> => {
        const request = await HostService.fetchAllPendingRequest();
        return { success: true, data: request };
    }
);

// Fetch all accepted request
export const fetchAllAcceptedRequest = api(
    { expose: true, method: "GET", path: "/hosts/request/accepted" },
    async (): Promise<SuccessFetchAllRequest> => {
        const request = await HostService.fetchAllAcceptedRequest();
        return { success: true, data: request };
    }
);

// Fetch all accepted request for agentId
export const fetchAllAcceptedRequestByAgentId = api(
    { expose: true, method: "GET", path: "/hosts/request/accepted/:agentId" },
    async ({ agentId }: { agentId: string }): Promise<SuccessFetchAllRequest> => {
        const request = await HostService.fetchAllAcceptedRequestByAgentId(agentId);
        return { success: true, data: request };
    }
);


// Fetch request for userId
export const fetchRequestByUserId = api(
    { expose: true, method: "GET", path: "/hosts/request/user/:userId" },
    async ({ userId }: { userId: string }): Promise<SuccessFetchRequest> => {
        const data = await HostService.fetchRequestByUserId(userId);
        return { success: true, data };
    }
);