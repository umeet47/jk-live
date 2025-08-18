import P2PMessageRepository from "../../p2p/p2p.repository";
import UserService from "../../users/user.service";

const P2PMessageService = {
    getConversationUsersFilterList: async (regNo: number) => {
        const user = await UserService.findByRegNo(regNo);
        const userId = user.id
        const conversations = await P2PMessageRepository.getConversationUsers(userId);
        const userIds = new Set<string>();
        conversations.forEach(({ senderId, receiverId }) => {
            if (senderId !== userId) userIds.add(senderId);
            if (receiverId !== userId) userIds.add(receiverId);
        });

        // Fetch user details along with the last message
        const users = await UserService.findByIdsWithLastMessage(Array.from(userIds), userId);

        // Return the list of users with their details and last message
        return users
    },
    fetchP2pMessageHistory: async ({ page, pageSize, targetUserId, userId }: { page: number; pageSize: number, userId: string; targetUserId: string }) => {
        const skip = (page - 1) * pageSize; // Calculate the number of records to skip
        const take = pageSize; // Number of records to fetch
        const [messageHistory, count] = await P2PMessageRepository.fetchAllAndCount(userId, targetUserId, skip, take);
        messageHistory.sort((a, b) => {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
        return { data: messageHistory, totalCount: count }
    }
};

export default P2PMessageService;
