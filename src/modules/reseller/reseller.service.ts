import { APIError } from "encore.dev/api";
import { REAL_UPDATE } from "../../common/enum";
import { getSocketInstance } from "../realtime/socket.service";
import ResellerRepository from "./reseller.repository";

const ResellerService = {
    // Make a user a reseller
    makeReseller: async (regNo: number) => {
        const user = await ResellerRepository.makeReseller(regNo);
        if (!user) {
            throw APIError.notFound("User not found with the provided registration number.");
        }
        return user;
    },

    // Remove a user from reseller
    removeReseller: async (regNo: number) => {
        const user = await ResellerRepository.removeReseller(regNo);
        if (!user) {
            throw APIError.notFound("User not found with the provided registration number.");
        }
        return user;
    },

    // List all resellers
    listResellers: async () => {
        return await ResellerRepository.listResellers();
    },

    // Transfer diamonds
    transferDiamonds: async (senderId: string, receiverId: string, diamond: number) => {
        if (senderId === receiverId) {
            throw APIError.aborted("You cannot transfer diamonds to yourself.");
        }
        const io = getSocketInstance();
        const { resellerHistory } = await ResellerRepository.transferDiamonds(senderId, receiverId, diamond);
        io.emit(REAL_UPDATE.DIAMOND_TRANSFER_BY_RESELLER, { data: resellerHistory });
        return resellerHistory;
    },

    // Fetch reseller transaction history
    getResellerHistory: async (resellerId: string) => {
        const history = await ResellerRepository.getResellerHistory(resellerId);
        return history;
    },
};

export default ResellerService;