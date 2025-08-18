import { MessageType } from "../socket.constant"
export interface IMakeVideoCallDto {
    targetUserId: string
    roomId:string   
    type: 'audio' | 'video'
}


export interface IReceivedVideoCallDto {
    targetUserId: string
    roomId:string
}

export interface IAcceptVideoCallDto {
    targetUserId: string
    roomId:string
}
export interface IRejectVideoCallDto {
    targetUserId: string
    roomId:string
}
export interface IEndVideoCallDto {
    targetUserId: string
    roomId:string
}

export interface IMakeCallDto {
    targetUserId: string
}
export interface ICallingReceivedDto {
    targetUserId: string
}
export interface IReceivedDto {
    targetUserId: string
}
export interface IEndCallDto {
    targetUserId: string
}
export interface IP2PMuteDto {
    targetUserId: string
}
export interface IP2PUnmuteDto {
    targetUserId: string
}
export interface IP2PPauseDto {
    targetUserId: string
}
export interface IP2PResumeDto {
    targetUserId: string
}

export interface P2PMessageDto {
    targetUserId: string;
    text: string,
    messageType: MessageType
}
export interface IMarkMessagesAsSeenDto {
    senderId: string
}

export interface IFetchP2PMessageHistoryDto {
    targetUserId: string,
    page: number;
    pageSize: number
}

export interface IOfferDto {
    offer: any;
    targetUserId: string
}
export interface IAnswerDto {
    answer: any;
    targetUserId: string
}

export interface ISendIceCandidateDto {
    candidate: any;
    targetUserId: string
}

export interface MessageHistory {
    message: string;
    senderId: string;
    receiverId: string;
    messageType: string;
    seen: boolean;
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface P2PMessageHistoryResponse {
    data: MessageHistory[];
    totalCount: number
}