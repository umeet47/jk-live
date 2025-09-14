import { Server, Socket } from "socket.io";
import { EMIT, LISTEN } from "../socket.constant";
import { Callback, handleEvent } from "../helper/socket.helper";
import AgentService from "../../agent/agent.service";

export const handleRoomEvents = (socket: Socket, io: Server | null) => {
    socket.on(LISTEN.SEND_AGENT_LIST, async (_data: unknown,
        callback: Callback<undefined>) => {
        await handleEvent(socket, LISTEN.SEND_AGENT_LIST, callback,
            async () => {
                const result = await AgentService.getAgentIdsWithTotalDiamonds()
                io?.emit(EMIT.AGENT_LIST, result)
                return undefined
            })
    })
}