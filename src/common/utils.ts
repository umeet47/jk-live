import { APIError, middleware, Middleware } from "encore.dev/api";
import jwt from "jsonwebtoken";
import { getAuthData } from "~encore/auth";
import { Paginated } from "./interface";
import log from "encore.dev/log";
import { TokensDto } from "../modules/users/user.interface";

type PaginatedParams = {
  size: number;
  page: number;
  count: number;
};
export const multiplier = 1.02

export const getOffset = (page: number, size: number): number => {
  return size * (page - 1);
};

export const paginatedData = (params: PaginatedParams): Paginated => {
  const response = {
    current: params.page,
    pageSize: params.size,
    totalPages: Math.ceil(params.count / params.size),
    count: params.count,
  };
  return response;
};

export const generateTokens = (payload: { userID: string }): TokensDto => {
  const accessSecret = process.env.ACCESS_TOKEN_SECRET || "secretAccessToken1";
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET || "secretRefreshToken1";
  const accessExpiry = process.env.ACCESS_TOKEN_SECRET_EXPIRES_IN || "30d" as any;
  const refreshExpiry = process.env.REFRESH_TOKEN_SECRET_EXPIRES_IN || "100d" as any;
  const accessToken = jwt.sign(payload, accessSecret, {
    expiresIn: accessExpiry,
  });
  const refreshToken = jwt.sign(payload, refreshSecret, {
    expiresIn: refreshExpiry,
  });
  return { accessToken, refreshToken };
};

export const AdminMiddleware: Middleware = middleware(
  { target: { auth: true } },
  async (req, next) => {
    // do something before the api handler
    const role = getAuthData()!.role;
    if (role !== "ADMIN") {
      throw APIError.unauthenticated("Only Admin is allowed");
    }
    const resp = await next(req);
    // do something after the api handler
    return resp;
  }
);
export const UserMiddleware: Middleware = middleware(
  { target: { auth: true } },
  async (req, next) => {
    // do something before the api handler
    const user = getAuthData();
    const role = user!.role;
    log.info("user", user)
    log.info("role", role)
    // if (role !== "ADMIN") {
    //   throw APIError.unauthenticated("Only Admin is allowed");
    // }

    const resp = await next(req);
    // do something after the api handler
    return resp;
  }
);
export const verifyAccessToken = (token: string): string => {
  try {

    const accessSecret = process.env.ACCESS_TOKEN_SECRET || "secretAccessToken1";
    const data = jwt.verify(token, accessSecret);
    const userID = typeof data === "string" ? data : data.userID;
    return userID;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw APIError.unauthenticated(error.message);
    }
    throw error;
  }
};

export const verifyRefreshToken = (token: string): string => {
  try {
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || "secretRefreshToken1";
    const data = jwt.verify(token, refreshSecret);
    const userID = typeof data === "string" ? data : data.userID;
    return userID;
  } catch (error) {
    throw APIError.unauthenticated(error?.toString() || "Invalid Token");
  }
};

// Helper function to format duration in "hh:mm:ss"
const formatDuration = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
};