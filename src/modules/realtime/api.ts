import { api } from "encore.dev/api";
import { getSocketInstance } from "./socket.service";
import { initializeSocketServer } from "./socket.service";
import { REAL_UPDATE } from "../../common/enum";
import RoomHistoryRepository from "./repositories/roomHistory.repository";
import P2PMessageService from "./services/realtime.service";
import { MessageHistory } from "./interfaces/p2p-call.interface";
import { UserWithLastMessageOnlyDto } from "../users/user.interface";

// Initialize Socket.IO server on app startup
// Singleton pattern to ensure socket server is initialized only once
let isSocketInitialized = false;

const ensureSocketServer = async () => {
  if (!isSocketInitialized) {
    await initializeSocketServer();
    isSocketInitialized = true;
  }
};
// Initialize server on module load with error handling
(async () => {
  try {
    await ensureSocketServer();
  } catch (error) {
    console.error("Failed to initialize Socket.IO server:", error);
    process.exit(1); // Exit with failure if initialization fails
  }
})();

interface SendMessageResponse {
  success: boolean;
  data: string;
}

export const sendMessage = api(
  { method: "POST", path: "/send-message" },
  async ({ text }: { text: string }): Promise<SendMessageResponse> => {
    const io = getSocketInstance();
    io.emit(REAL_UPDATE.MESSSAGE, { text });
    return { success: true, data: text };
  }
);
interface ReadMessageResponse {
  success: boolean;
  data: any;
}

export const readMessage = api(
  { method: "GET", path: "/send-message" },
  (): ReadMessageResponse => {
    const io = getSocketInstance();
    const data = {
      text: "hi everyone",
    };
    io.emit(REAL_UPDATE.MESSSAGE, data);
    return { success: true, data };
  }
);

export const fetchRoomHistory = api(
  { method: "GET", expose: true, path: "/room-history" },
  async (): Promise<ReadMessageResponse> => {
    const roomHistories = await RoomHistoryRepository.getRoomHistory()
    return { success: true, data: roomHistories };
  }
);

export const getConversationUsersFilterListByRegNo = api(
  { method: "GET", expose: true, path: "/conversation/list/:regNo" },
  async ({ regNo }: { regNo: string }): Promise<{ success: boolean; data: UserWithLastMessageOnlyDto[]; }> => {
    const regNoInt = parseInt(regNo, 10);
    const users = await P2PMessageService.getConversationUsersFilterList(regNoInt)
    return { success: true, data: users };
  }
);

export const fetchP2pMessageHistory = api(
  { method: "GET", expose: true, path: "/p2p-message-history" },
  async ({ page, pageSize, targetUserId, userId }: { page: number; pageSize: number, userId: string; targetUserId: string }):
    Promise<{ success: boolean; data: MessageHistory[]; totalCount: number }> => {
    const { data, totalCount } = await P2PMessageService.fetchP2pMessageHistory({ page, pageSize, targetUserId, userId })
    return { success: true, data, totalCount };
  }
); 
