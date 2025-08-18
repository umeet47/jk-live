import { MediaKind, RtpCapabilities, RtpParameters } from "mediasoup/node/lib/rtpParametersTypes";
import { Consumer, ConsumerType, Producer, Transport } from "mediasoup/node/lib/types";
import { DtlsParameters, IceCandidate, IceParameters } from "mediasoup/node/lib/WebRtcTransportTypes";
import { UserDto } from "../../users/user.interface";
import { PackagePurchase } from "@prisma/client";

interface IRoom {
    roomId: string;
}
export interface ICreateRoom {
    // userId: string;
    // callType: "live" | "p2p";
    roomType?: string; // "audio" | "video"
}

export interface IJoinRoom extends IRoom { }
export interface ILeaveRoom extends IRoom { }
export interface IKickoutFromRoom extends IRoom {
    memberId: string;
}
export interface IKickoutFromProducing extends IRoom {
    memberId: string;
}
export interface IRequestToProduce extends IRoom { }
export interface IAcceptRequest extends IRoom {
    memberId: string;
}
export interface IDeclineRequest extends IRoom {
    memberId: string;
}
export interface IDeleteRoom extends IRoom { }
export interface IHasProduced extends IRoom { }
export interface IAddOwnToProduceList extends IRoom { }
export interface IHasJoined extends IRoom { }
export interface ISendInroomMessage extends IRoom {
    data: any;
}
export interface IBlockInRoomMessage extends IRoom {
    isBlock: boolean;
}

export interface ActivePackage {
    id: string
    name: string
    type: string //VIP, VVIP
    validity: number // Store validity in days, months, or years TODO can be change to days which can be converted to month or years
    amount: number
    imageUrl: string
    entryAnimation: string | null
    purchaseDate: Date | null
    expiryDate: Date | null
    createdAt: Date
    updatedAt: Date
}

export interface Member {
    id: string;
    fullname: string;
    email: string | null;
    mobile: string | null;
    profilePic: string | null;
    role: string;
    accountType: string;
    diamond: number;
    diamondLevel: number;
    ActivePackage: ActivePackage | null;
}

export interface ProducerStat {
    userId: string;
    producer: {
        video: boolean;
        isVideoPause: boolean;
        isAudioPause: boolean;
        audio: boolean;
    };
    userDetails: Member;
}

export interface IJoinRoomResponse {
    rtpCapabilities: RtpCapabilities
    producerStats: ProducerStat[]
    roomStartTime: number
    focusUser: string
}


export enum TransportType {
    producer = "producer",
    consumer = "consumer",
}
export interface ICreateWebrtcTransport {
    roomId: string;
    transportType: TransportType;
    // callType: "audio";
}

export interface ITransportConnectDto {
    roomId: string;
    dtlsParameters: DtlsParameters;
    transportType: TransportType;
    callType: MediaKind;
}


export interface ICreateWebrtcTransportResponse {
    params: {
        id: string;
        iceParameters: IceParameters;
        iceCandidates: IceCandidate[];
        dtlsParameters: DtlsParameters;
    };
    transportType: TransportType;
}

export interface IProducer {
    transport: Transport;
    video?: Producer;
    audio?: Producer;
}
export interface IConsumerClient {
    video?: Consumer;
    audio?: Consumer;
}
export interface IConsumer {
    transport: Transport;
    client: Map<string, IConsumerClient>; // clientId, its IConsumerClient
}

export interface IConsumePayload {
    kind: MediaKind;
    rtpCapabilities: RtpCapabilities;
    clientId: string;
}

export interface IConsumeDto {
    rtpCapabilities: RtpCapabilities;
    kind: MediaKind;
    roomId: string;
    clientId: string;
}
export interface IConsumeResponse {
    producerId: string;
    id: string;
    kind: MediaKind;
    rtpParameters: RtpParameters;
    type: ConsumerType;
    producerPaused: boolean;
}
export interface IProduceDto {
    roomId: string;
    kind: MediaKind;
    rtpParameters: RtpParameters;
}
export interface IProducePayload {
    kind: MediaKind;
    rtpParameters: RtpParameters;
}
export interface IConsumeResumeDto {
    consumerUserId: string;
    kind: MediaKind;
    roomId: string;
}
export interface IConsumeResumePayload {
    consumerUserId: string;
    kind: MediaKind;
    userId: string;
}

export interface IProducerPauseDto {
    kind: MediaKind;
    roomId: string;
    clientId: string;
}

export interface IProducerPausePayload {
    kind: MediaKind;
    clientId: string;
}

export interface IProducerResumePayload {
    kind: MediaKind;
    clientId: string;
}

export interface IProducerResumeDto {
    kind: MediaKind;
    roomId: string;
    clientId: string;
}

export interface InformRoomCreatedDto {
    roomId: string;
}

export interface DiamondMessageDto {
    senderId: string;
    senderFullname: string;
    amount: number;
    receiverId: string;
    receiverFullname: string;
    createdAt: Date;
}

export interface IRoomInfos {
    roomId: string;
    isLive: boolean;
    creator: UserDto;
    memberCount: number;
    roomStartTime: number;
    videoProducers: number;
    audioProducers: number;
    consumerCount: number;
}

export interface IBlockUserInRoomDto {
    roomId: string;
    blockedId: string;
}