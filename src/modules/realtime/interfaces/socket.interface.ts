import { MessageType } from "../socket.constant";
import { DiamondMessageDto } from "./room.interface";

export interface ISendDiamond {
  roomId: string;
  receiverId: string;
  receiverName: string;
  amount: number;
}

export interface ISendDiamondResponse {
  message: DiamondMessageDto
}

export interface StoreMessagePayload {
  message: string
  senderId: string
  receiverId: string
  messageType: MessageType
}
