export interface DiamondExchange {
    id: string;
    diamond: number;
    createdAt: Date;
    updatedAt: Date;
    amount: number;
    currency: string;
}
export interface AddDiamondExchangeDto {
    diamond: number;
    amount: number;
}
export interface UpdateDiamondExchangeDto {
    id: string;
    diamond?: number;
    amount?: number;
}

export interface AddDiamondExchangeResponse {
    success: boolean;
    data: DiamondExchange
}

export interface RemoveDiamondExchangeResponse {
    success: boolean;
    data: DiamondExchange
}

export interface DiamondExchangeListResponse {
    success: boolean;
    data: DiamondExchange[]
}