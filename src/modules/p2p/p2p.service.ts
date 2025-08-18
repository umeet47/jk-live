import P2PMessageRepository from "./p2p.repository";

const P2PMessageService = {
    // Clear all messages between two users from the perspective of one user
    clearChatHistory: async (userId: string, targetUserId: string) => {
        // Clear all messages sent by the user to the target user
        await P2PMessageRepository.clearMessagesForUser(userId, targetUserId);

        // Clear all messages sent by the target user to the user
        await P2PMessageRepository.clearMessagesSentByUser(userId, targetUserId);
    },
    // Fetch P2P message history between two users
    fetchMessageHistory: async (userId1: string, userId2: string, page: number, pageSize: number) => {
        const skip = (page - 1) * pageSize; // Calculate the number of records to skip
        const take = pageSize; // Number of records to fetch

        const [data, totalCount] = await P2PMessageRepository.fetchAllAndCount(userId1, userId2, skip, take);

        // Sort messages in ascending order (oldest to newest)
        data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        return { data, totalCount };
    },
};

export default P2PMessageService;