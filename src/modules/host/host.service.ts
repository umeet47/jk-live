import { APIError } from "encore.dev/api";
import { REAL_UPDATE } from "../../common/enum";
import { getSocketInstance } from "../realtime/socket.service";
import { HostRequestDto, LeaveAgentDto, RemoveFromAgentDto } from "./host.interface";
import HostRepository from "./host.repository";

const HostService = {
    createHostRequest: async (data: HostRequestDto) => {
        const request = await HostRepository.createHostRequest(data);
        const io = getSocketInstance();
        io.to(request.agentId).emit(REAL_UPDATE.HOST_REQUEST, { data: request });
        return request
    },

    updateHostRequest: async (requestId: string, status: string) => {
        const request = await HostRepository.findHostRequestById(requestId);
        if (!request) {
            throw APIError.notFound("Host request not found");
        }

        const updatedRequest = status === "accepted" ?
            await HostRepository.acceptedHostRequest(requestId)
            : await HostRepository.rejectedHostRequest(requestId);
        const io = getSocketInstance();
        io.to(updatedRequest.userId).emit(REAL_UPDATE.HOST_REQUEST_RESPONSE, { data: updatedRequest });
        return updatedRequest
    },

    leaveAgent: async ({ agentId, userId }: LeaveAgentDto) => {
        const hostRequest = await HostRepository.findByAgentAndUserId(agentId, userId)
        if (!hostRequest) {
            throw APIError.notFound("User is not found in agent host list")
        }
        return HostRepository.removeHostRequest(hostRequest.id, userId)
    },

    removeFromAgent: async ({ agentId, userId }: RemoveFromAgentDto) => {
        const hostRequest = await HostRepository.findByAgentAndUserId(agentId, userId)
        if (!hostRequest) {
            throw APIError.notFound("User is not found in agent host list")
        }
        return HostRepository.removeHostRequest(hostRequest.id, userId)
    },

    fetchAllPendingRequest: async () => {
        return HostRepository.findPendingHostRequest();
    },
    fetchAllAcceptedRequest: async () => {
        return HostRepository.findAcceptedHostRequest();
    },
    fetchAllAcceptedRequestByAgentId: async (agentId: string) => {
        return HostRepository.fetchAllAcceptedRequestByAgentId(agentId);
    },
    fetchRequestByUserId: async (userId: string) => {
        return await HostRepository.findByUserId(userId);
    }
};

export default HostService;