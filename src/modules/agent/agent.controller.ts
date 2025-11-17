import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { MakeAgentDto, RemoveAgentDto, SuccessMessage, SuccessMessageWithAgent, SuccessMessageWithAgentAndTotalDiamond } from "./agent.interface";
import AgentService from "./agent.service";

// Make a user an agent
export const makeAgent = api(
    { expose: true, auth: true, method: "POST", path: "/agents/make" },
    async (data: MakeAgentDto): Promise<SuccessMessage> => {
        const role = getAuthData()!.role
        if (role !== "ADMIN") {
            throw APIError.permissionDenied("Only Admin is allowed")
        }
        await AgentService.makeAgent(data.regNo);
        return { success: true, message: "User is now an agent" };
    }
);

// Remove an agent
export const removeAgent = api(
    { expose: true, auth: true, method: "POST", path: "/agents/remove" },
    async (data: RemoveAgentDto): Promise<SuccessMessage> => {
        const role = getAuthData()!.role
        if (role !== "ADMIN") {
            throw APIError.permissionDenied("nly Admin is allowed")
        }
        await AgentService.removeAgent(data.regNo);
        return { success: true, message: "User is no longer an agent" };
    }
);

// List all agents
export const listAgents = api(
    { expose: true, auth: true, method: "GET", path: "/agents" },
    async (): Promise<SuccessMessageWithAgent> => {
        const agents = await AgentService.listAgents();
        return {
            success: true,
            data: agents,
            message: "Agent list successfully fetched!!"
        };
    }
);


// API to get the list of agents with their total diamond count
export const getAgentsWithTotalDiamonds = api(
    { expose: true, auth: true, method: "GET", path: "/agents/diamonds" },
    async (): Promise<SuccessMessageWithAgentAndTotalDiamond> => {
        const agents = await AgentService.getAgentsWithTotalDiamonds();
        return { success: true, data: agents };
    }
);