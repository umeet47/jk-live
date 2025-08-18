import { UserDto } from "../users/user.interface";

export interface SuccessResellerCreatedResponse {
    success: boolean;
    message: string;
}

export interface SuccessResellerRemovedResponse {
    success: boolean;
    message: string;
}
export interface SuccessResellersListResponse {
    success: boolean;
    data: UserDto[];
}
export interface ResellerHistory {
    id: string;
    diamond: number;
    createdAt: Date;
    updatedAt: Date;
    senderId: string;
    receiverId: string;
}
export interface ResellerHistoryWithReceiverDetails extends ResellerHistory {
    Receiver: UserDto
}
export interface SuccessResellerTransferDiamondResponse {
    success: boolean;
    data: ResellerHistory
}
export interface SuccessResellerTransferHistoryListResponse {
    success: boolean;
    data: ResellerHistoryWithReceiverDetails[]
}

export interface ResellerTransferDiamondDto {
    senderId: string;
    receiverId: string;
    diamond: number
}
