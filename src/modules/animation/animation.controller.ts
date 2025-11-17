import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { UserDto } from "../users/user.interface";
import {
  AnimationListResponse,
  AnimationResponse,
  CreateAnimationDto,
} from "./animation.interface";
import AnimationService from "./animation.service";

/**
 * Method to create a new animation by admin
 */
export const createAnimation = api(
  { expose: true, auth: true, method: "POST", path: "/animations" },
  async (data: CreateAnimationDto): Promise<AnimationResponse> => {
    const role = getAuthData()!.role
    if (role !== "ADMIN") {
      throw APIError.permissionDenied("nly Admin is allowed")
    }
    const result = await AnimationService.createAnimation(data);
    return { success: true, result };
  }
);

// /**
//  * Method to update given animation by admin
//  */
// export const updateAnimation = api(
//   { expose: true, auth: true, method: "PATCH", path: "/animations/:id" },
//   async ({
//     data,
//     id,
//   }: {
//     data: UpdateAnimationDto;
//     id: string;
//   }): Promise<AnimationResponse> => {
//     try {
// const role = getAuthData()!.role
//     if (role !== "ADMIN") {
//       throw APIError.permissionDenied("Only Admin is allowed")
//     }
//       const result = await AnimationService.updateAnimation(data, id);
//       return { success: true, result };
//     } catch (error) {
//       throw APIError.aborted(
//         error?.toString() || "Error updating the animation"
//       );
//     }
//   }
// );

/**
 * Method to update given animation by admin
 */
export const removeAnimation = api(
  { expose: true, auth: true, method: "DELETE", path: "/animations/:id" },
  async ({ id }: { id: string }): Promise<{ success: boolean }> => {
    const role = getAuthData()!.role
    if (role !== "ADMIN") {
      throw APIError.permissionDenied("Only Admin is allowed")
    }
    await AnimationService.removeAnimation(id);
    return { success: true };
  }
);

/**
 * Method to fetch list of animation
 */
export const fetchAllAnimation = api(
  { expose: true, auth: true, method: "GET", path: "/animations" },
  async (): Promise<AnimationListResponse> => {
    const result = await AnimationService.fetchAllAnimation();
    return { success: true, result };
  }
);


interface BuyAnimationDto {
  animationId: string
  userId: string
}
interface BuyAnimationResponse {
  success: boolean;
  data: UserDto
}
export const buyProfileFrame = api(
  { expose: true, auth: true, method: "POST", path: "/animations/buy" },
  async ({ animationId, userId }: BuyAnimationDto): Promise<BuyAnimationResponse> => {
    const response = await AnimationService.buyAnimation(animationId, userId);
    return { success: true, data: response };
  })