import { APIError } from "encore.dev/api";
import AgentRepository from "./agent.repository";

const AgentService = {
    makeAgent: async (regNo: number) => {
        const user = await AgentRepository.getUserIdByRegNo(regNo);
        if (!user) {
            throw APIError.notFound("User not found");
        }
        return AgentRepository.makeAgent(user.id);
    },
    removeAgent: async (regNo: number) => {
        const user = await AgentRepository.getUserIdByRegNo(regNo);
        if (!user) {
            throw APIError.notFound("User not found");
        }
        return AgentRepository.removeAgent(user.id);
    },
    listAgents: async () => {
        return AgentRepository.listAgents();
    },
    getAgentIdsWithTotalDiamonds: async () => {
        const agents = await AgentRepository.listAgentsWithHostDiamondOnly();

        // Calculate total diamond count for each agent
        const agentList = agents.map(({ HostRequestAgent, ...agent }) => {
            const totalDiamonds = HostRequestAgent.reduce((sum, hostRequest) => {
                return sum + (hostRequest.user?.diamond || 0);
            }, 0);
            const totalHostCount = HostRequestAgent.length;

            return {
                agentId: agent.id,
                totalDiamonds,
                totalHostCount
            };
        });

        // Sort agents by total diamond count in descending order
        agentList.sort((a, b) => b.totalDiamonds - a.totalDiamonds);
        return agentList;
    },

    // Get agents with total diamond count of their hosts
    getAgentsWithTotalDiamonds: async () => {
        const agents = await AgentRepository.listAgentsWithHostDiamond();

        // Calculate total diamond count for each agent
        const agentList = agents.map(({ HostRequestAgent, ...agent }) => {
            const totalDiamonds = HostRequestAgent.reduce((sum, hostRequest) => {
                return sum + (hostRequest.user?.diamond || 0);
            }, 0);

            return {
                ...agent,
                totalDiamonds,
            };
        });

        // Sort agents by total diamond count in descending order
        agentList.sort((a, b) => b.totalDiamonds - a.totalDiamonds);
        return agentList;
    },
};

export default AgentService;