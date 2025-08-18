import { api } from "encore.dev/api";
import FollowService from "./follow.service";
import { SuccessFollowedResponse, SuccessFollowerResponse, SuccessFollowResponse, SuccessUnfollowResponse } from "./follow.interface";

// API to follow a user
export const followUser = api(
    { expose: true, method: "POST", path: "/follow/:targetUserId" },
    async ({ userId, targetUserId }: { targetUserId: string; userId: string; }): Promise<SuccessFollowResponse> => {
        // try {
        await FollowService.followUser(userId, targetUserId);
        return { success: true, message: "User followed successfully." };
        // } catch (error) {
        //     throw APIError.unknown(error?.toString() || "Error following user.");
        // }
    }
);

// API to unfollow a user
export const unfollowUser = api(
    { expose: true, method: "POST", path: "/unfollow/:targetUserId" },
    async ({ userId, targetUserId }: { userId: string; targetUserId: string }): Promise<SuccessUnfollowResponse> => {
        // try {
        await FollowService.unfollowUser(userId, targetUserId);
        return { success: true, message: "User unfollowed successfully." };
        // } catch (error) {
        //     throw APIError.unknown(error?.toString() || "Error unfollowing user.");
        // }
    }
);

// API to get the list of users followed by me
export const getFollowedUsers = api(
    { expose: true, method: "GET", path: "/followed-users/:userId" },
    async ({ userId }: { userId: string }): Promise<SuccessFollowedResponse> => {
        // try {
        const followedUsers = await FollowService.getFollowedUsers(userId);
        return { success: true, data: followedUsers };
        // } catch (error) {
        //     throw APIError.unknown(error?.toString() || "Error fetching followed users.");
        // }
    }
);

// API to get the list of users following me
export const getFollowers = api(
    { expose: true, method: "GET", path: "/followers/:userId" },
    async ({ userId }: { userId: string }): Promise<SuccessFollowerResponse> => {
        // try {
        const followers = await FollowService.getFollowers(userId);
        return { success: true, data: followers };
        // } catch (error) {
        //     throw APIError.unknown(error?.toString() || "Error fetching followers.");
        // }
    }
);