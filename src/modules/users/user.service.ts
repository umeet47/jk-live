import { Prisma } from "@prisma/client";
import {
  CreateUserDto,
  UpdateUserDto,
  LoginUserDto,
  UserLoginResponse,
  UserDto,
  UserWithPagination,
  DiamondHistoryPayload,
  UserWithLastMessageDto,
  UserWithLastMessageOnlyDto,
  UserWithPackagePurchase,
  UserWithFollower,
  UserWithFollowing,
  GoogleDto,
  loginWithMobileDto,
  UserWithDevicesDto,
} from "./user.interface";
import { APIError } from "encore.dev/api";
import bcrypt from "bcrypt";
import UserRepository from "./user.repository";
import { OAuth2Client } from "google-auth-library";
import { CLIENT_ID } from "./user.constant";
import log from "encore.dev/log";
import DeviceService from "../device/device.service";
import { prisma } from "../../common/database";
import { REAL_UPDATE } from "../../common/enum";
import { PaginationDto } from "../../common/interface";
import { generateTokens, getOffset, paginatedData } from "../../common/utils";
import P2PMessageRepository from "../p2p/p2p.repository";
import { getSocketInstance, activeUsers } from "../realtime/socket.service";
import { PurchaseEnum } from "./users.enum";

const UserService = {
  transferDiamondWithoutHistory: async (
    data: { fromUserId: string, toUserId: string, diamond: number }) => {
    const { fromUserId, toUserId, diamond } = data;
    const fromUser = await UserRepository.findByUserId(fromUserId);
    if (!fromUser) {
      throw APIError.notFound("Sender user not found");
    }
    const toUser = await UserRepository.findByUserId(toUserId);
    if (!toUser) {
      throw APIError.notFound("Receiver user not found");
    }
    if (fromUser.diamond < diamond) {
      throw APIError.aborted("Insufficient diamond balance");
    }
    // Deduct diamond from sender
    fromUser.diamond -= diamond;
    if (fromUser.diamond < 0) {
      throw APIError.aborted("Current diamond is less than deducted diamond");
    }
    // Add diamond to receiver
    toUser.diamond += diamond;
    await UserRepository.updateUsers({
      fromUserId,
      toUserId,
      fromUserDiamond: fromUser.diamond,
      toUserDiamond: toUser.diamond
    });
  },
  addRemoveDiamondFromOrToUserWithoutHistory: async ({
    userId,
    diamond,
    status,
  }: {
    userId: string;
    diamond: number;
    status: string; // "add" | "subtract"
  }) => {
    const user = await UserRepository.findByUserId(userId);
    if (!user) {
      throw APIError.notFound("User not found");
    }
    let newDiamond = user.diamond
    if (status === "add") {
      newDiamond += diamond;
    } else if (status === "subtract") {
      newDiamond -= diamond;
      if (newDiamond < 0) {
        throw APIError.aborted("Current diamond is less than deducted diamond");
      }
    }
    await UserRepository.updateDiamond(newDiamond, userId);
  },
  count: async (): Promise<number> => {
    const count = await UserRepository.totalUserCount();
    const io = getSocketInstance();
    io.emit(REAL_UPDATE.USER_COUNT, { count });
    return count;
  },

  removeDiamond: async ({ amount, userId }: { userId: string; amount: number }) => {
    const user = await UserRepository.findByUserId(userId);
    if (!user) {
      throw APIError.notFound("User not found");
    }
    if (user.diamond <= 0) {
      throw APIError.aborted("User has no diamond to remove");
    }
    const newDiamond = user.diamond - amount;
    await UserRepository.updateDiamond(newDiamond, userId);
  },

  create: async (payload: CreateUserDto): Promise<UserDto> => {
    const userExist = await UserRepository.findByEmail(payload.email);

    if (userExist) {
      throw APIError.alreadyExists("User already exist with given email");
    }

    const data: Prisma.UserCreateInput = {
      ...payload,
      accountType: "REGULAR",
      role: "USER",
    };

    return await UserRepository.createUser(data);
  },
  createAdmin: async (payload: CreateUserDto): Promise<UserDto> => {
    const userExist = await UserRepository.findByEmail(payload.email);

    if (userExist) {
      throw APIError.alreadyExists("User already exist with given email");
    }

    const data: Prisma.UserCreateInput = {
      ...payload,
      accountType: "VVIP",
      role: "ADMIN",
    };

    return await UserRepository.createUser(data);
  },

  googleLogin: async ({ deviceId, token }: GoogleDto): Promise<UserLoginResponse> => {
    try {
      log.info("deviceId", deviceId)
      const client = new OAuth2Client(CLIENT_ID);
      // Verify the ID token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Ensure token was issued for this client
      });

      // Extract the payload
      const payload = ticket.getPayload();
      if (!payload) {
        throw APIError.permissionDenied("Details not found");
      }

      // User information from the token
      const user = {
        googleId: payload["sub"], // Unique user ID
        email: payload["email"],
        name: payload["name"],
        picture: payload["picture"],
        emailVerified: payload["email_verified"],
      };

      if (!user.email) {
        throw APIError.unauthenticated("Email not exist");
      }

      let userDetails = await UserRepository.findByEmailWithActiveData(user.email);

      if (!userDetails) {
        const data: Prisma.UserCreateInput = {
          email: user.email,
          profilePic: user.picture,
          fullname: user.name || user.googleId,
          accountType: "REGULAR",
          role: "USER",
        };

        userDetails = await UserRepository.createUser(data);
      } else {
        if (userDetails.isAccountBlocked) {
          throw APIError.permissionDenied("Not Allowed");
        }
        // Check if the user is already connected via WebSocket
        if (activeUsers.has(userDetails.id)) {
          throw APIError.permissionDenied("User is already logged in on another device.");
        }
      }

      // Handle the device during login
      await DeviceService.handleDeviceOnLogin(userDetails.id, deviceId);

      const { accessToken, refreshToken } = generateTokens({
        userID: String(userDetails.id),
      });

      return {
        success: true,
        result: {
          accessToken,
          refreshToken,
          data: userDetails,
        },
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.unauthenticated("Invalid or expired token");
    }
  },

  login: async ({ deviceId, email, password }: LoginUserDto): Promise<UserLoginResponse> => {
    const user = await UserRepository.findByUserEmailWithPassword(email);

    if (!user) {
      throw APIError.unauthenticated("User not found");
    }
    if (user.isAccountBlocked) {
      throw APIError.permissionDenied("Not Allowed");
    }

    const oldPassword = user.password;
    if (!oldPassword) {
      throw APIError.unauthenticated("Password not found");
    }

    const verify = await bcrypt.compare(password, oldPassword);
    if (!verify) {
      throw APIError.unauthenticated("Wrong password");
    }

    // Check if the user is already connected via WebSocket
    if (activeUsers.has(user.id)) {
      throw APIError.unauthenticated("User is already logged in on another device.");
    }

    // Handle the device during login
    await DeviceService.handleDeviceOnLogin(user.id, deviceId);

    const { accessToken, refreshToken } = generateTokens({
      userID: String(user.id),
    });

    const { password: _, ...data } = user;
    return {
      success: true,
      result: {
        accessToken,
        refreshToken,
        data,
      },
    };
  },

  adminLogin: async (payload: LoginUserDto) => {
    const user = await UserRepository.findByUserEmailWithPassword(
      payload.email
    );

    if (!user) {
      throw APIError.unauthenticated("User not found");
    }

    const password = user.password;
    if (!password) {
      throw APIError.unauthenticated("Password not found");
    }

    const verify = await bcrypt.compare(payload.password, password);
    if (!verify) {
      throw APIError.unauthenticated("Wrong password");
    }

    if (user.role !== "ADMIN") {
      throw APIError.unauthenticated("Only Admin is allowed");
    }

    await DeviceService.handleDeviceOnLogin(user.id, payload.deviceId);

    const { accessToken, refreshToken } = generateTokens({
      userID: String(user.id),
    });

    const { password: _, ...data } = user;
    return {
      success: true,
      result: {
        accessToken,
        refreshToken,
        data,
      },
    };
  },

  update: async (id: string, data: UpdateUserDto): Promise<UserDto> => {
    const user = await UserRepository.findByUserId(id);
    if (!user) {
      throw APIError.notFound("User not found");
    }
    const updated = await UserRepository.updateUser(data, id);

    const io = getSocketInstance();
    io.emit(REAL_UPDATE.USER_UPDATED, { user: updated });

    return updated;
  },

  find: async (data: PaginationDto): Promise<UserWithPagination> => {
    let users: UserWithPackagePurchase[] = [];
    const pageSize = data.page ? data.page : 1;
    const limitSize = data.limit ? data.limit : 10;
    const offset = getOffset(pageSize, limitSize);
    const count = await UserRepository.totalUserCount();
    users = await UserRepository.findAllWithPagination({
      take: limitSize,
      skip: offset,

    });
    const pagination = paginatedData({
      size: limitSize,
      page: pageSize,
      count,
    });
    return {
      // result: users.map((user) => user),
      result: users,
      pagination,
    };
  },

  findOne: async (id: string): Promise<UserDto> => {
    const user = await UserRepository.findByUserIdWithActiveData(id);
    if (!user) {
      throw APIError.notFound("User not found");
    }
    return user;
  },

  findOneWithActiveData: async (id: string): Promise<UserWithDevicesDto> => {
    const user = await UserRepository.findByUserIdWithActiveDataAndDevice(id);
    if (!user) {
      throw APIError.notFound("User not found");
    }
    if (user.deviceId) {
      const device = await DeviceService.findByDeviceId(user.deviceId);
      if (device) {
        return { ...user, Devices: [device] };
      }
    }
    return { ...user, Devices: [] };
  },
  findOneWithActiveDataByRegNo: async (regNo: number): Promise<UserDto> => {
    const user = await UserRepository.findByRegNoWithActiveData(regNo);
    if (!user) {
      throw APIError.notFound("User not found");
    }
    return user;
  },
  findOneWithFollower: async (id: string): Promise<UserWithFollower> => {
    const user = await UserRepository.findOneWithFollower(id);
    if (!user) {
      throw APIError.notFound("User not found");
    }
    return user;
  },

  findOneWithFollowing: async (id: string): Promise<UserWithFollowing> => {
    const user = await UserRepository.findOneWithFollowing(id);
    if (!user) {
      throw APIError.notFound("User not found");
    }
    return user;
  },

  findByIdsWithLastMessageAndOnlineStatus: async (ids: string[], currentUserId: string): Promise<UserWithLastMessageDto[]> => {
    // Fetch user details along with the last message between the current user and each user
    const users = await Promise.all(
      ids.map(async (userId) => {
        // Fetch user details
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { ActivePackage: true, ActiveAnimation: true, ActiveProfileFrame: true }
        });

        if (!user) {
          throw APIError.notFound(`User with ID ${userId} not found`);
        }

        // Fetch the last message between the current user and this user
        const lastMessage = await prisma.p2PMessage.findFirst({
          where: {
            OR: [
              { senderId: currentUserId, receiverId: userId },
              { senderId: userId, receiverId: currentUserId },
            ],
          },
          orderBy: {
            createdAt: "desc", // Get the most recent message
          },
        });
        const unseenCount = await P2PMessageRepository.countUnseenMessages(currentUserId, userId);

        return {
          ...user,
          lastMessage,
          isOnline: activeUsers.has(userId), // Check if the user is online
          unseenCount
        };
      })
    );

    return users;
  },

  findByIdsWithLastMessage: async (ids: string[], currentUserId: string): Promise<UserWithLastMessageOnlyDto[]> => {
    // Fetch user details along with the last message between the current user and each user
    const users = await Promise.all(
      ids.map(async (userId) => {
        // Fetch user details
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { ActivePackage: true, ActiveAnimation: true, ActiveProfileFrame: true }
        });

        if (!user) {
          throw APIError.notFound(`User with ID ${userId} not found`);
        }

        // Fetch the last message between the current user and this user
        const lastMessage = await prisma.p2PMessage.findFirst({
          where: {
            OR: [
              { senderId: currentUserId, receiverId: userId },
              { senderId: userId, receiverId: currentUserId },
            ],
          },
          orderBy: {
            createdAt: "desc", // Get the most recent message
          },
        });

        return {
          ...user,
          lastMessage,
        };
      })
    );

    return users;
  },
  tempUpdateDiamondByEmail: async (email: string): Promise<void> => {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw APIError.notFound("User not found");
    }
    await UserRepository.tempUpdateDiamond(user.id)
  },
  delete: async (id: string): Promise<string> => {
    const user = await UserRepository.findByUserId(id);
    if (!user) {
      throw APIError.notFound("User not found");
    }
    await UserRepository.remove(id);
    return "User deleted successfully";
  },

  addDiamondToUser: async (diamond: number, id: string, adminId: string) => {
    const user = await UserRepository.findByUserId(id);
    if (!user) {
      throw APIError.notFound("User not found");
    }
    const diamondHistoryPayload: DiamondHistoryPayload = {
      diamond,
      type: "add",
      handlerId: adminId,
      userId: id,
    };
    const updatedUser = await UserRepository.updateUserAndUpdateDiamondHistory(
      diamond,
      id,
      diamondHistoryPayload
    );

    const io = getSocketInstance();
    io.emit(REAL_UPDATE.USER_UPDATED, { user: updatedUser });

    return updatedUser;
  },
  transferDiamond: async (
    amount: number,
    receiverId: string,
    senderId: string,
    diamondSendPercentage: {
      percentage: number;
      subtractFrom: string;
    }) => {
    await UserRepository.updateDiamonds(amount, receiverId, senderId, diamondSendPercentage)
  },
  removeDiamondFromUser: async (diamond: number, adminId: string, userId: string) => {
    const user = await UserRepository.findByUserId(userId);
    if (!user) {
      throw APIError.notFound("User not found");
    }
    user.diamond = user.diamond - diamond;
    if (user.diamond < 0) {
      throw APIError.aborted("Current diamond is less than deducted diamond");
    }

    // TODO: regarding diamond level
    const diamondHistoryPayload: DiamondHistoryPayload = {
      diamond,
      handlerId: adminId,
      type: "remove",
      userId
    }
    const updatedUser = await UserRepository.subtractDiamondsAndUpdateDiamondHistory(diamond, userId, diamondHistoryPayload);

    const io = getSocketInstance();
    io.emit(REAL_UPDATE.USER_UPDATED, { user: updatedUser });

    return updatedUser;
  },
  makeAgent: async (userId: string) => {
    const user = await UserRepository.findByUserId(userId);
    if (!user) {
      throw APIError.notFound("User not found");
    }
    user.isAgent = true

    return UserRepository.updateUser(user, userId);
  },
  removeAgent: async (userId: string) => {
    const user = await UserRepository.findByUserId(userId);
    if (!user) {
      throw APIError.notFound("User not found");
    }
    if (user.isAgent === true) {
      throw APIError.aborted("User is already agent");
    }
    user.isAgent = false

    return UserRepository.updateUser(user, userId);
  },

  findByRegNo: async (regNo: number): Promise<UserDto> => {
    const user = await UserRepository.findByRegNo(regNo);
    if (!user) {
      throw APIError.notFound("User not found");
    }
    return user;
  },

  checkExist: async (id: string) => {
    const user = await UserRepository.findByUserId(id);
    if (!user) {
      throw APIError.notFound("User not found");
    }
    return user;
  },
  // Update the regNumber of a user
  updateRegNumber: async (userId: string, newRegNumber: number) => {
    // Check if the new regNumber is already in use
    const isInUse = await UserRepository.isRegNumberInUse(newRegNumber);
    if (isInUse) {
      throw new Error(`Registration number ${newRegNumber} is already in use.`);
    }

    // Update the regNumber
    return await UserRepository.updateRegNumber(userId, newRegNumber);
  },
  // Fetch all conversation users associated with the given regNo user
  fetchAllConversationListOfGivenRegNo: async (regNo: number) => {
    const user = await UserRepository.findByRegNoWithLimitedData(regNo);
    if (!user) {
      throw APIError.notFound("User not found");
    }

    const messages = await UserRepository.fetchAllConversationAssociatedListByUserId(user.id);

    // Extract unique users from the messages
    const associatedUsers = new Map<string, { id: string; fullname: string; profilePic: string | null }>();

    messages.forEach((message) => {
      if (message.senderId !== user.id) {
        associatedUsers.set(message.senderId, message.MessageSender);
      }
      if (message.receiverId !== user.id) {
        associatedUsers.set(message.receiverId, message.MessageReceiver);
      }
    });

    return {
      searchUserDetail: user,
      conversationUsers: Array.from(associatedUsers.values()),
    };
  },
  fetchTopFiveGifter: async () => {
    return UserRepository.fetchTopFiveGifter()
  },
  removePurchase: async (userId: string, purchaseType: string) => {
    const user = await UserRepository.findByUserId(userId);
    if (!user) {
      throw APIError.notFound("User not found");
    }
    switch (purchaseType) {
      case PurchaseEnum.ANIMATION:
        await UserRepository.removeAnimationFromUser(user.id);
        break;
      case PurchaseEnum.PROFILE_FRAME:
        await UserRepository.removeProfileFrameFromUser(user.id);
        break;
      case PurchaseEnum.VIP_PACKAGE:
        await UserRepository.removeVipPackageFromUser(user.id);
        break;
      default:
        throw APIError.aborted("Invalid purchase type");
    }
  },
  getUserInfo: async (id: string) => {
    const user = await UserRepository.getUserInfo(id)
    if (!user) {
      throw APIError.notFound("User not found");
    }
    return user
  },
  getUserInfoWithAgencyData: async (id: string) => {
    const user = await UserRepository.getUserInfoWithAgencyData(id)
    if (!user) {
      throw APIError.notFound("User not found");
    }
    return user
  },
  getAllMemberDetails: async (ids: string[]) => {
    const user = await UserRepository.getManyUserInfoWithAgencyData(ids)
    return user
  },

  loginWithMobile: async ({
    mobileNumber,
    password,
    deviceId,
  }: loginWithMobileDto) => {
    // Check if the user exists
    let user = await UserRepository.findByMobile(mobileNumber);

    if (!user) {
      // If user doesn't exist, create a new user
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await UserRepository.createUser({
        mobile: mobileNumber,
        password: hashedPassword,
        deviceId,
        fullname: "New User", // Default name for new users
        role: "USER",
      });
    } else {
      // If user exists, verify the password
      const isPasswordValid = await bcrypt.compare(password, user.password || "");
      if (!isPasswordValid) {
        throw APIError.unauthenticated("Invalid password");
      }
    }

    // Handle the device during login
    await DeviceService.handleDeviceOnLogin(user.id, deviceId);

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = generateTokens({ userID: user.id });
    const { password: _, ...data } = user;

    return {
      success: true,
      result: {
        accessToken,
        refreshToken,
        data,
      },
    };
  },
};

export default UserService;
