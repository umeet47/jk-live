import { UserDto } from "../users/user.interface";

export interface FollowingUserDto extends UserDto { }
export interface FollowersUserDto extends UserDto { }
export interface SuccessFollowResponse {
    success: boolean;
    message: string;
}
export interface SuccessUnfollowResponse {
    success: boolean;
    message: string;
}
export interface SuccessFollowedResponse {
    success: boolean;
    data: FollowingUserDto[]
}
export interface SuccessFollowerResponse {
    success: boolean;
    data: FollowersUserDto[]
}