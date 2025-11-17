import { api } from "encore.dev/api";
import { SuccessFollowedResponse, SuccessFollowerResponse, SuccessFollowResponse, SuccessUnfollowResponse } from "./follow.interface";
import FollowService from "./follow.service";

// API to follow a user
export const followUser = api(
    { expose: true, auth: true, method: "POST", path: "/follow/:targetUserId" },
    async ({ userId, targetUserId }: { targetUserId: string; userId: string; }): Promise<SuccessFollowResponse> => {
        await FollowService.followUser(userId, targetUserId);
        return { success: true, message: "User followed successfully." };

    }
);

// API to unfollow a user
export const unfollowUser = api(
    { expose: true, auth: true, method: "POST", path: "/unfollow/:targetUserId" },
    async ({ userId, targetUserId }: { userId: string; targetUserId: string }): Promise<SuccessUnfollowResponse> => {
        await FollowService.unfollowUser(userId, targetUserId);
        return { success: true, message: "User unfollowed successfully." };
    }
);

// API to get the list of users followed by me
export const getFollowedUsers = api(
    { expose: true, auth: true, method: "GET", path: "/followed-users/:userId" },
    async ({ userId }: { userId: string }): Promise<SuccessFollowedResponse> => {
        const followedUsers = await FollowService.getFollowedUsers(userId);
        return { success: true, data: followedUsers };
    }
);

// API to get the list of users following me
export const getFollowers = api(
    { expose: true, auth: true, method: "GET", path: "/followers/:userId" },
    async ({ userId }: { userId: string }): Promise<SuccessFollowerResponse> => {
        const followers = await FollowService.getFollowers(userId);
        return { success: true, data: followers };
    }
);