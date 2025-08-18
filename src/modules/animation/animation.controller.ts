import { api } from "encore.dev/api";
import {
  AnimationListResponse,
  AnimationResponse,
  CreateAnimationDto,
} from "./animation.interface";
import AnimationService from "./animation.service";
import { UserDto } from "../users/user.interface";

/**
 * Method to create a new animation by admin
 */
export const createAnimation = api(
  { expose: true, auth: true, method: "POST", path: "/animations" },
  async (data: CreateAnimationDto): Promise<AnimationResponse> => {
    // try {
    const result = await AnimationService.createAnimation(data);
    return { success: true, result };
    // } catch (error) {
    //   throw APIError.aborted(
    //     error?.toString() || "Error creating the animation"
    //   );
    // }
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
    // try {
    await AnimationService.removeAnimation(id);
    return { success: true };
    // } catch (error) {
    //   throw APIError.aborted(
    //     error?.toString() || "Error removing the animation"
    //   );
    // }
  }
);

/**
 * Method to fetch list of animation
 */
export const fetchAllAnimation = api(
  { expose: true, method: "GET", path: "/animations" },
  async (): Promise<AnimationListResponse> => {
    // try {
    const result = await AnimationService.fetchAllAnimation();
    return { success: true, result };
    // } catch (error) {
    //   throw APIError.aborted(
    //     error?.toString() || "Error fetching list of the animation"
    //   );
    // }
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
export const buyProfileFrame = api({ expose: true, method: "POST", path: "/animations/buy" },
  async ({ animationId, userId }: BuyAnimationDto): Promise<BuyAnimationResponse> => {
    // try {
    const response = await AnimationService.buyAnimation(animationId, userId);
    return { success: true, data: response };
    // } catch (error) {
    //   throw APIError.aborted(
    //     error?.toString() || "Error buy animation"
    //   );
    // }
  })