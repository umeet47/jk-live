import { api } from "encore.dev/api";
import P2PMessageService from "./p2p.service";
import { MessageHistory } from "../realtime/interfaces/p2p-call.interface";

// API to clear chat history with a specific user
export const clearChatHistory = api(
    { expose: true, method: "DELETE", path: "/p2p-message/clear/:targetUserId" },
    async ({ userId, targetUserId }:
        { userId: string; targetUserId: string })
        : Promise<{ success: boolean; message: string; }> => {
        await P2PMessageService.clearChatHistory(userId, targetUserId);
        return {
            success: true, message: "Chat history cleared successfully."
        };
    }
);

interface FetchP2PMessageHistoryDto {
    userId1: string;
    userId2: string;
    page?: number;
    pageSize?: number;
}
// API to fetch P2P message history between two users
export const fetchP2PMessageHistory = api(
    { expose: true, method: "GET", path: "/p2p-message/history/:userId1/:userId2" },
    async ({ userId1, userId2, page = 1, pageSize = 20,
    }: FetchP2PMessageHistoryDto): Promise<{ success: boolean; data: MessageHistory[], totalCount: number }> => {
        const { data, totalCount } = await P2PMessageService.fetchMessageHistory(userId1, userId2, page, pageSize);
        return { success: true, data, totalCount };
    }
);
