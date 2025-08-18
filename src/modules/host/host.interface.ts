import { UserDto } from "../users/user.interface";

export type HostingType = "audio" | "video";

export interface HostRequestDto {
    userId: string;
    agentId: string;
    type: HostingType
}

export interface UpdateHostRequestDto {
    requestId: string;
    status: "accepted" | "rejected";
}
export interface LeaveAgentDto {
    userId: string;
    agentId: string;
}
export interface RemoveFromAgentDto {
    userId: string;
    agentId: string;
}
export interface SuccessRequest {
    success: boolean;
    data: {
        id: string;
        type: string;
        status: string;
        userId: string;
        agentId: string;
        createdAt: Date;
        updatedAt: Date;
        user: UserDto;
    }
}
export interface SuccessFetchAllRequest {
    success: boolean;
    data: {
        id: string;
        type: string;
        status: string;
        userId: string;
        agentId: string;
        createdAt: Date;
        updatedAt: Date;
        user: UserDto;
    }[]
}

export interface SuccessFetchRequest {
    success: boolean;
    data: {
        id: string;
        type: string;
        status: string;
        userId: string;
        agentId: string;
        createdAt: Date;
        updatedAt: Date;
        user: UserDto;
    } | null;
}