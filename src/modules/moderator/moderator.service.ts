import { APIError } from "encore.dev/api";
import ModeratorRepository from "./moderator.repository";

const ModeratorService = {
    makeModerator: async (regNo: number) => {
        const user = await ModeratorRepository.getUserIdByRegNo(regNo);
        if (!user) {
            throw APIError.notFound("User not found");
        }
        return ModeratorRepository.makeModerator(user.id);
    },
    removeModerator: async (regNo: number) => {
        const user = await ModeratorRepository.getUserIdByRegNo(regNo);
        if (!user) {
            throw APIError.notFound("User not found");
        }
        return ModeratorRepository.removeModerator(user.id);
    },
    listModerators: async () => {
        return ModeratorRepository.listModerators();
    },
};

export default ModeratorService;