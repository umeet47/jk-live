import { DiamondExchange } from "../diamond-exchange/diamond-exchange.interface";
import { UserBaseDto } from "../users/user.interface";

export interface WithdrawRequest {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    diamondExchangeId: string;
    paymentType: string;
    userFullname: string;
    userNumber: string;
    status: string;
}
export interface WithdrawRequestWithExtraData extends WithdrawRequest {
    diamondExchange: DiamondExchange
    user: UserBaseDto
}
export interface CreateWithdrawRequestDto {
    userId: string;
    diamondExchangeId: string;
    paymentType: string;
    userFullname: string;
    userNumber: string;
}
export interface CreateWithdrawRequestResponse {
    success: boolean;
    data: WithdrawRequest;
}
export interface UpdateWithdrawRequestResponse {
    success: boolean;
    data: WithdrawRequest;
}
export interface WithdrawRequestWithUser extends WithdrawRequest {
    diamondExchange: DiamondExchange
}

export interface AllWithdrawRequestListResponse {
    success: boolean;
    data: WithdrawRequest[];
}

export interface AllWithdrawRequestListWithUserResponse {
    success: boolean;
    data: WithdrawRequestWithUser[];
}
export interface AllWithdrawRequestListWithExtraDataResponse {
    success: boolean;
    data: WithdrawRequestWithExtraData[];
}

export interface WithdrawSummaryResponse {
    success: boolean;
    data: {
        totalIncome: number;
        totalWithdraw: number;
    }
}