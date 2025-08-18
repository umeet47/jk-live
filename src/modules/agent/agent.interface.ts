import { UserDto } from "../users/user.interface";

export interface MakeAgentDto {
    regNo: number
}
export interface RemoveAgentDto {
    regNo: number
}
export interface ISuccessAgent {
    message: string
    success: boolean
}

export interface SuccessMessage { success: boolean; message: string }
export interface SuccessMessageWithAgent extends SuccessMessage {
    data: UserDto[];
}
export interface UserWithTotalDiamondDto extends UserDto {
    totalDiamonds: number;
}
export interface SuccessMessageWithAgentAndTotalDiamond {
    success: boolean;
    data: UserWithTotalDiamondDto[];
}