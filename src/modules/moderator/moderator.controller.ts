import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { MakeModeratorDto, RemoveModeratorDto, SuccessMessage, SuccessMessageWithModerator } from "./moderator.interface";
import ModeratorService from "./moderator.service";

// Make a user a moderator
export const makeModerator = api(
    { expose: true, auth: true, method: "POST", path: "/moderators/make" },
    async (data: MakeModeratorDto): Promise<SuccessMessage> => {
        const role = getAuthData()!.role
        if (role !== "ADMIN") {
            throw APIError.permissionDenied("Only Admin is allowed")
        }
        await ModeratorService.makeModerator(data.regNo);
        return { success: true, message: "User is now an moderator" };
    }
);

// Remove an moderator
export const removeModerator = api(
    { expose: true, auth: true, method: "POST", path: "/moderators/remove" },
    async (data: RemoveModeratorDto): Promise<SuccessMessage> => {
        const role = getAuthData()!.role
        if (role !== "ADMIN") {
            throw APIError.permissionDenied("Only Admin is allowed")
        }
        await ModeratorService.removeModerator(data.regNo);
        return { success: true, message: "User is no longer an moderator" };
    }
);

// List all moderators
export const listModerators = api(
    { expose: true, auth: true, method: "GET", path: "/moderators" },
    async (): Promise<SuccessMessageWithModerator> => {
        const role = getAuthData()!.role
        if (role !== "ADMIN") {
            throw APIError.permissionDenied("Only Admin is allowed")
        }
        const data = await ModeratorService.listModerators();
        return {
            success: true,
            data,
            message: "Moderator list successfully fetched!!"
        };
    }
);

