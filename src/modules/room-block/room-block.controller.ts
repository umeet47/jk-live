import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { UserDto } from "../users/user.interface";
import RoomBlockService from "./room-block.service";

/**
 * Method to List all room blocks for a given blockerId.
 */
export const listRoomBlockApi = api(
    { expose: true, auth: true, method: "GET", path: "/room-block/:blockerId" },
    async ({ blockerId }: { blockerId: string }): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            blockerId: string;
            blockedId: string;
            blocked: UserDto;
        }[];
    }> => {
        const result = await RoomBlockService.findBlockedList(blockerId);
        return { success: true, data: result };
    }
);


export const unblockUser = api(
    { expose: true, auth: true, method: "DELETE", path: "/room-block/unblock/:blockedId" },
    async ({ blockedId }: { blockedId: string }): Promise<{
        success: boolean;
    }> => {
        const userId = getAuthData()!.userID;
        await RoomBlockService.unblockUser(userId, blockedId);
        return { success: true, };
    }
);