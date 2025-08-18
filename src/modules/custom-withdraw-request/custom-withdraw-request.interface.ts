
export interface CustomWithdrawRequest {
    id: string;
    userId: string;
    amount: number;
    paymentType: string;
    userFullname: string;
    userNumber: string;
    note: string | null;
    status: string; //"pending" | "accepted" | "rejected"
    createdAt: Date;
    updatedAt: Date;
}
// export interface CustomWithdrawRequestWithExtraData extends CustomWithdrawRequest {
//     diamondExchange: DiamondExchange
//     user: UserBaseDto
// }
export interface CreateCustomWithdrawRequestDto {
    userId: string;
    amount: number;
    paymentType: string;
    userFullname: string;
    userNumber: string;
}
export interface CreateCustomWithdrawRequestResponse {
    success: boolean;
    data: CustomWithdrawRequest;
}
export interface UpdateCustomWithdrawRequestResponse {
    success: boolean;
    data: CustomWithdrawRequest;
}

export interface AllCustomWithdrawRequestListResponse {
    success: boolean;
    data: CustomWithdrawRequest[];
}

// export interface AllCustomWithdrawRequestListWithUserResponse {
//     success: boolean;
//     data: CustomWithdrawRequestWithUser[];
// }
// export interface AllCustomWithdrawRequestListWithExtraDataResponse {
//     success: boolean;
//     data: CustomWithdrawRequestWithExtraData[];
// }

// export interface CustomWithdrawSummaryResponse {
//     success: boolean;
//     data: {
//         totalIncome: number;
//         totalWithdraw: number;
//     }
// }