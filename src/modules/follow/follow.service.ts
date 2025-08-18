import { APIError } from "encore.dev/api";
import FollowRepository from "./follow.repository";
import log from "encore.dev/log";
import { getSocketInstance } from "../realtime/socket.service";
import { REAL_UPDATE } from "../../common/enum";
import PersonalNotificationService from "../personal-notification/personal-notification.service";

const FollowService = {
    // Follow a user
    followUser: async (userId: string, targetUserId: string) => {
        if (userId === targetUserId) {
            throw APIError.aborted("You cannot follow yourself.");
        }
        const user = await FollowRepository.getFollowedUsers(userId);
        const isAlreadyFollowing = user?.Following.some(followedUser => followedUser.id === targetUserId);

        if (isAlreadyFollowing) {
            throw APIError.aborted("You are already following this user.");
        }
        const result = await FollowRepository.followUser(userId, targetUserId);
        await PersonalNotificationService.createAndSendPersonalNotification({
            userId: targetUserId,
            title: "follow",
            description: `${user?.fullname} has followed you.`,
            senderInfo: {
                id: userId,
                fullname: user?.fullname,
                profilePic: user?.profilePic,
            }
        })
        return result
    },

    // Unfollow a user
    unfollowUser: async (userId: string, targetUserId: string) => {
        if (userId === targetUserId) {
            throw APIError.aborted("You cannot unfollow yourself.");
        }

        // Check if the user is already following the target user
        const user = await FollowRepository.getFollowedUsers(userId);
        const isFollowing = user?.Following.some(followedUser => followedUser.id === targetUserId);

        if (!isFollowing) {
            throw APIError.aborted("You are not following this user.");
        }
        const result = await FollowRepository.unfollowUser(userId, targetUserId);

        await PersonalNotificationService.createAndSendPersonalNotification({
            userId: targetUserId,
            title: "unfollow",
            description: `${user?.fullname} has unfollowed you.`,
            senderInfo: {
                id: userId,
                fullname: user?.fullname,
                profilePic: user?.profilePic,
            }
        })
        return result;
    },

    // Get the list of users followed by me
    getFollowedUsers: async (userId: string) => {
        const user = await FollowRepository.getFollowedUsers(userId);
        return user?.Following || [];
    },

    // Get the list of users following me
    getFollowers: async (userId: string) => {
        const user = await FollowRepository.getFollowers(userId);
        return user?.Followers || [];
    },

    checkFollowStatus: async (targetId: string, id: string) => {
        try {
            const isFollowing = await FollowRepository.checkFollowStatus(targetId, id);
            return !!isFollowing; // Return true if the relationship exists, otherwise false
        } catch (error) {
            log.error("Error checking follow status", { targetId, id, error });
            throw APIError.unknown("Unable to check follow status. Please try again later.");
        }
    }
};

export default FollowService;