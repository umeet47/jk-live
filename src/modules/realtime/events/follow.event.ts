import { Socket } from "socket.io";
import { LISTEN } from "../socket.constant";
import { Callback, handleEvent } from "../helper/socket.helper";
import FollowService from "../../follow/follow.service";
import { Member } from "../interfaces/room.interface";

export const handleFollowUnFollowEvents = (socket: Socket) => {
    socket.on(LISTEN.CHECK_FOLLOW_STATUS, async ({ targetId }: { targetId: string },
        callback: Callback<{ hasFollow: boolean }>) => {
        await handleEvent(socket, LISTEN.CHECK_FOLLOW_STATUS, callback,
            async ({ id }: Member) => {
                const hasFollow = await FollowService.checkFollowStatus(targetId, id)
                return { hasFollow }
            })
    })
}