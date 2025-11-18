import { APIError, Gateway, Header } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";

import log from "encore.dev/log";
import UserService from "../users/user.service";
import { verifyAccessToken } from "../../common/utils";

interface AuthParams {
  authorization: Header<"Authorization">;
}

interface AuthData {
  userID: string;
  role: string;
  accountType: string;
  isReseller: boolean;
  deviceId: string | null;
}

export const myAuthHandler = authHandler(
  async (params: AuthParams): Promise<AuthData> => {
    const token = params.authorization.replace("Bearer ", "");

    if (!token) {
      throw APIError.unauthenticated("no token provided");
    }
    log.info(`token ${JSON.stringify(token)}`);

    try {
      const userID = verifyAccessToken(token);
      const user = await UserService.findOne(userID);
      const role = user.role;
      const accountType = user.accountType;
      const deviceId = user.deviceId
      // if (role !== "ADMIN") {
      if (!deviceId) {
        throw APIError.unauthenticated("Device id not found")
      }
      // }
      return { userID, role, accountType, isReseller: user.isReseller, deviceId: user.deviceId };
    } catch (e) {
      log.error(`Error while authenticating Error: ${e}`);
      throw APIError.unauthenticated(
        e?.toString() || "invalid token",
        e as Error
      );
    }
  }
);

export const mygw = new Gateway({ authHandler: myAuthHandler });
