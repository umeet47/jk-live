export interface CreateGiftDto {
    videoUrl?: string;
    audioUrl?: string;
    gifUrl?: string;
    amount: number;
}

export interface UpdateGiftDto {
    id: string;
    videoUrl?: string;
    audioUrl?: string;
    gifUrl?: string;
    amount?: number;
}

export interface GiftDto {
    id: string;
    videoUrl: string | null;
    audioUrl: string | null;
    gifUrl: string | null;
    amount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISuccessGift {
    success: boolean;
    data: GiftDto
}

export interface ISuccessGifts {
    success: boolean;
    data: GiftDto[]
}