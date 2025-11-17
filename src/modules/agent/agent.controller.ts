import { api } from "encore.dev/api";
import AgentService from "./agent.service";
import { MakeAgentDto, RemoveAgentDto, SuccessMessage, SuccessMessageWithAgent, SuccessMessageWithAgentAndTotalDiamond } from "./agent.interface";

// Make a user an agent
export const makeAgent = api(
    { expose: true, auth: true, method: "POST", path: "/agents/make" },
    async (data: MakeAgentDto): Promise<SuccessMessage> => {
        await AgentService.makeAgent(data.regNo);
        return { success: true, message: "User is now an agent" };
    }
);

// Remove an agent
export const removeAgent = api(
    { expose: true, auth: true, method: "POST", path: "/agents/remove" },
    async (data: RemoveAgentDto): Promise<SuccessMessage> => {
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