import { api } from "encore.dev/api";
import ProfileFrameService from "./profile-frame.service";
import { CreateProfileFrameDto, ProfileFrameListResponse, ProfileFrameResponse } from "./profile-frame.interface";
import { UserDto } from "../users/user.interface";

/**
 * Method to create a new profile frame by admin
 */
export const createProfileFrame = api(
  { expose: true, auth: true, method: "POST", path: "/profile-frames" },
  async (data: CreateProfileFrameDto): Promise<ProfileFrameResponse> => {
    const result = await ProfileFrameService.createProfileFrame(data);
    return { success: true, data: result };
  }
);

/**
 * Method to update given profile frame by admin
 */
export const removeProfileFrame = api(
  { expose: true, auth: true, method: "DELETE", path: "/profile-frames/:id" },
  async ({ id }: { id: string }): Promise<{ success: boolean }> => {
    await ProfileFrameService.removeProfileFrame(id);
    return { success: true };
  }
);

/**
 * Method to fetch list of profile frame
 */
export const fetchAllProfileFrame = api(
  { expose: true, auth: true, method: "GET", path: "/profile-frames" },
  async (): Promise<ProfileFrameListResponse> => {
    const result = await ProfileFrameService.fetchAllProfileFrame();
    return { success: true, data: result };
  }
);


interface BuyProfileFrameDto {
  profileFrameId: string
  userId: string
}
interface BuyProfileFrameResponse {
  success: boolean;
  data: UserDto
}
export const buyProfileFrame = api(
  { expose: true, auth: true, method: "POST", path: "/profile-frames/buy" },
  async ({ profileFrameId, userId }: BuyProfileFrameDto): Promise<BuyProfileFrameResponse> => {
    const response = await ProfileFrameService.buyProfileFrame(profileFrameId, userId);
    return { success: true, data: response };
  })