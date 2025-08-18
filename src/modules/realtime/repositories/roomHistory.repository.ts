import log from "encore.dev/log";
import { prismaWithoutExtend } from "../../../common/database";
import Room from "../services/room.service";

const RoomHistoryRepository = {
    saveRoomHistory: async (room: Room) => {
        Array.from(room.getUserActivity.entries()).map(([userId, activity]) => {
            // console.log(`User ${userId} spent ${activity.totalTime} ms in the room`)
            log.info("UserActivity: ", activity)
            log.info("UserId: ", userId)
        })

        return prismaWithoutExtend.roomHistory.create({
            data: {
                roomId: room.getRoomId(),
                roomCreatorId: room.getCreatorInfo().id,
                roomCreatorName: room.getCreatorInfo().fullname,
                roomStartTime: new Date(room.getRoomStartTime),
                roomEndTime: new Date(room.getRoomEndTime || Date.now()),
                totalRoomDuration: room.getRoomDuration(),
                // UserActivity: {
                //     create: Array.from(room.getUserActivity.entries()).map(([userId, activity]) => ({
                //         userId,
                //         userName: room.getMemberDetails(userId).fullname || "",
                //         totalTime: activity.totalTime,
                //     })),
                // },
            },
        });
    },
    getRoomHistory: async () => {
        return prismaWithoutExtend.roomHistory.findMany({
            include: { UserActivity: true, Creator: true }
        })
    }
};

export default RoomHistoryRepository;
