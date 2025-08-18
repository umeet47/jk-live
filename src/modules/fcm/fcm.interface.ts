export interface FcmTokenDto {
    userId: string;
    token: string;
}

export interface FcmNotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}
export interface ISaveTokenResponse {
    success: boolean;
    message: string;
}
export interface IDeleteTokenResponse {
    success: boolean;
    message: string;
}
export interface ISendNotificationResponse {
    success: boolean;
    message: string;
}