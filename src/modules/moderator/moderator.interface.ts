import { UserDto } from "../users/user.interface";

export interface MakeModeratorDto {
    regNo: number
}
export interface RemoveModeratorDto {
    regNo: number
}

export interface SuccessMessage { success: boolean; message: string }
export interface SuccessMessageWithModerator extends SuccessMessage {
    data: UserDto[];
}