import { ExtendedError, Socket } from "socket.io";
import { APIError } from "encore.dev/api";
import { Member } from "../modules/realtime/interfaces/room.interface";
import UserService from "../modules/users/user.service";
import { verifyAccessToken } from "./utils";

export const socketMiddleware = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
): Promise<void> => {
  try {
    const tokenWithBearer = socket.handshake.auth.token;
    const token = tokenWithBearer.split(" ")[1];
    const userID = verifyAccessToken(token);
    if (!userID) throw APIError.permissionDenied("unauthorized");
    const user = await UserService.findOne(userID);
    const deviceId = user.deviceId
    if (!deviceId) {
      throw APIError.unauthenticated("Device id not found")
    }
    const data: Member = {
      id: user.id,
      fullname: user.fullname,
      mobile: user.mobile,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role,
      accountType: user.accountType,
      diamond: user.diamond,
      diamondLevel: user.diamondLevel,
      ActivePackage: user.ActivePackage,
    };
    socket.data = data;
    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(APIError.permissionDenied("unauthorized"));
  }
};
