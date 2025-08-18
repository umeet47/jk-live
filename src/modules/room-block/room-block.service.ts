import RoomBlockRepository from "./room-block.repository";

const RoomBlockService = {
    findBlockedList: async (blockerId: string) => {
        return await RoomBlockRepository.findByBlockerId(blockerId);
    },
    blockUser: async (blockerId: string, blockedId: string) => {
        return RoomBlockRepository.blockUser(blockerId, blockedId);
    },
    unblockUser: async (blockerId: string, blockedId: string) => {
        return RoomBlockRepository.unblockUser(blockerId, blockedId);
    },
    findByBlockerAndBlocked: async (blockerId: string, blockedId: string) => {
        return RoomBlockRepository.findByBlockerAndBlocked(blockerId, blockedId);
    }

};
export default RoomBlockService;
