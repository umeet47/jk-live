export interface CreatePersonalNotificationDto {
    title: string;
    description: string;
    userId: string;
    senderInfo?: {
        id: string;
        fullname?: string | null;
        profilePic?: string | null;
    };
}

export interface PersonalNotificationDto {
    id: string;
    title: string;
    description: string;
    expiryDate: Date;
    isRead: boolean;
    senderInfo: {
        id: string
        fullname?: string | null
        profilePic?: string | null;
    } | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}