import { api } from "encore.dev/api";
import { getSocketInstance } from "./socket.service";
import { initializeSocketServer } from "./socket.service";
import { REAL_UPDATE } from "../../common/enum";
import RoomHistoryRepository from "./repositories/roomHistory.repository";
import P2PMessageService from "./services/realtime.service";
import { MessageHistory } from "./interfaces/p2p-call.interface";
import { UserWithLastMessageOnlyDto } from "../users/user.interface";
import log from "encore.dev/log";

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

// ─── ICE / TURN credentials endpoint ──────────────────────────
// Returns ICE servers with credentials from server-side env vars.
// Clients should call this on each session instead of hardcoding creds.

interface IceServerEntry {
  urls: string | string[];
  username?: string;
  credential?: string;
}

interface IceServersResponse {
  success: boolean;
  iceServers: IceServerEntry[];
}

export const getIceServers = api(
  { method: "GET", expose: true, auth: true, path: "/ice-servers" },
  async (): Promise<IceServersResponse> => {
    const cfUser = process.env.CLOUDFLARE_TURN_USERNAME;
    const cfCred = process.env.CLOUDFLARE_TURN_CREDENTIAL;
    const meteredUser = process.env.METERED_TURN_USERNAME;
    const meteredCred = process.env.METERED_TURN_CREDENTIAL;

    if (!cfUser || !cfCred || !meteredUser || !meteredCred) {
      log.error("TURN credentials not configured in environment variables");
    }

    const iceServers: IceServerEntry[] = [
      // STUN servers (public, no credentials needed)
      { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
      { urls: ["stun:stun.cloudflare.com:3478", "stun:stun.cloudflare.com:53"] },
      { urls: "stun:stun.relay.metered.ca:80" },
    ];

    // Cloudflare TURN (only if configured)
    if (cfUser && cfCred) {
      iceServers.push({
        urls: [
          "turn:turn.cloudflare.com:3478?transport=udp",
          "turn:turn.cloudflare.com:3478?transport=tcp",
          "turns:turn.cloudflare.com:5349?transport=tcp",
          "turn:turn.cloudflare.com:53?transport=udp",
          "turn:turn.cloudflare.com:80?transport=tcp",
          "turns:turn.cloudflare.com:443?transport=tcp",
        ],
        username: cfUser,
        credential: cfCred,
      });
    }

    // Metered TURN (only if configured)
    if (meteredUser && meteredCred) {
      iceServers.push(
        { urls: "turn:global.relay.metered.ca:80", username: meteredUser, credential: meteredCred },
        { urls: "turn:global.relay.metered.ca:80?transport=tcp", username: meteredUser, credential: meteredCred },
        { urls: "turn:global.relay.metered.ca:443", username: meteredUser, credential: meteredCred },
        { urls: "turns:global.relay.metered.ca:443?transport=tcp", username: meteredUser, credential: meteredCred },
      );
    }

    return { success: true, iceServers };
  },
);