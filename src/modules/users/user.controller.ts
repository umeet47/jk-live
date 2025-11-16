import { api, APIError } from "encore.dev/api";
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponse,
  LoginUserDto,
  UserLoginResponse,
  UserDto,
  GoogleDto,
  UpdateRegNoResponse,
  UserWithActiveDataResponse,
  TopFiveGifterResponse,
  IFetchAllConversationListResponse,
  loginWithMobileDto,
  UserWithActiveDataAndDevicesResponse,
} from "./user.interface";
import UserService from "./user.service";
import { getAuthData } from "~encore/auth";
import { seedAdminUser } from "../../../prisma/seed";

/**
 * Method to create a new user
 */
export const googleApi = api(
  { expose: true, method: "POST", path: "/v6/google/login" },
  async (data: GoogleDto): Promise<UserLoginResponse> => {
    // try {
    if (!data.token || typeof data.token !== "string") {
      throw APIError.unauthenticated("Invalid token");
    }
    const result = await UserService.googleLogin(data);
    return result;
    // } catch (error) {
    //   throw APIError.unauthenticated(error?.toString() || "Invalid token");
    // }
  }
);

/**
 * Method to create a new user
 */
export const create = api(
  { expose: true, method: "POST", path: "/users" },
  async ({ data }: { data: CreateUserDto }): Promise<UserResponse> => {
    // try {
    if (!data.fullname || !data.email) {
      throw APIError.invalidArgument("Missing fields");
    }
    const result = await UserService.create(data);
    return { success: true, result };
    // } catch (error) {
    //   throw APIError.aborted(error?.toString() || "Error creating the user");
    // }
  }
);

/**
 * Method to create a new user admin
 */
export const createAdmin = api(
  { expose: true, method: "POST", path: "/users/admin" },
  async ({ data }: { data: CreateUserDto }): Promise<UserResponse> => {
    // try {
    if (!data.fullname || !data.email) {
      throw APIError.invalidArgument("Missing fields");
    }
    const result = await UserService.createAdmin(data);
    return { success: true, result };
    // } catch (error) {
    //   throw APIError.aborted(error?.toString() || "Error creating the admin");
    // }
  }
);

/**
 * Method to login or create and login with mobile number
 */
export const loginWithMobile = api(
  { expose: true, method: "POST", path: "/v6/login/mobile" },
  async ({ mobileNumber, password, deviceId, }: loginWithMobileDto): Promise<UserLoginResponse> => {
    return await UserService.loginWithMobile({ mobileNumber, password, deviceId });
  }
);

/**
 * Method to login
 */
export const login = api(
  { expose: true, method: "POST", path: "/v6/login" },
  async (data: LoginUserDto): Promise<UserLoginResponse> => {
    if (!data.email) {
      throw APIError.invalidArgument("Missing fields");
    }
    const result = await UserService.login(data);
    return result;
  }
);

/**
 * Method to login as admin
 */
export const adminLogin = api(
  { expose: true, method: "POST", path: "/admin/login" },
  async (data: LoginUserDto): Promise<UserLoginResponse> => {
    if (!data.email) {
      throw APIError.invalidArgument("Missing fields");
    }
    const result = await UserService.adminLogin(data);
    return result;
  }
);

// Authenticated

/**
 * Counts and returns the number of existing users
 */
export const count = api(
  { expose: true, method: "GET", path: "/count/users" },
  async (): Promise<{ success: boolean; count: number }> => {
    const count = await UserService.count();
    return { success: true, count };
  }
);

/**
 * Get all users data
 */
export const read = api(
  {
    expose: true,
    //  auth: true,
    method: "GET", path: "/users"
  },
  async (data: {
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    result: UserDto[];
  }> => {
    const { result } = await UserService.find(data);
    return { success: true, result };
  }
);

/**
 * Get user data by id
 */
export const readOne = api(
  {
    expose: true,
    //  auth: true,
    method: "GET", path: "/v6/users/:id"
  },
  async ({ id }: { id: string }): Promise<UserWithActiveDataAndDevicesResponse> => {
    const result = await UserService.findOneWithActiveData(id);
    return {
      success: true,
      result,
    };
  }
);
/**
 * Get user data by id
 */
export const readOneByRegNo = api(
  { expose: true, auth: true, method: "GET", path: "/users/reg-no/:regNo" },
  async ({ regNo }: { regNo: number }): Promise<UserWithActiveDataResponse> => {
    const result = await UserService.findOneWithActiveDataByRegNo(regNo);

    return {
      success: true,
      result,
    };
  }
);

/**
 * Update user data
 */
export const update = api(
  { expose: true, auth: true, method: "PATCH", path: "/users/:id" },
  async ({ id, data }: { id: string; data: UpdateUserDto; }): Promise<UserResponse> => {
    const result = await UserService.update(id, data);
    return {
      success: true,
      result,
    };
  }
);

/**
 * Delete user by id
 */
export const destroy = api(
  { expose: true, auth: true, method: "DELETE", path: "/users/:id" },
  async ({ id }: { id: string }): Promise<{ success: boolean }> => {
    await UserService.delete(id);
    return { success: true };
  }
);

/**
 *  Method to add diamond to specific user account
 */
export const addDiamondToUser = api(
  { expose: true, auth: true, method: "PATCH", path: "/diamond/add/:userId" },
  async ({ userId, diamond }: {
    userId: string; diamond: number;
  }): Promise<UserResponse> => {
    // Validate amount: must be a number and not negative
    if (typeof diamond !== "number" || Number.isNaN(diamond) || diamond < 0) {
      throw APIError.invalidArgument("Diamond must be a non-negative number");
    }
    const adminId = getAuthData()!.userID;
    const result = await UserService.addDiamondToUser(diamond, userId, adminId);
    return { success: true, result };
  }
);

/**
 * Method to remove the diamond of given user account
 */
export const removeDiamond = api(
  { expose: true, auth: true, method: "PATCH", path: "/diamond/remove/:userId", },
  async ({ userId, diamond, }: { userId: string; diamond: number; }): Promise<UserResponse> => {
    const adminId = getAuthData()!.userID;
    const result = await UserService.removeDiamondFromUser(diamond, adminId, userId);
    return { success: true, result };
  }
);


/**
 * Counts and returns the number of existing users
 */
export const tempUserUpdate = api(
  { expose: true, method: "GET", path: "/temp/users/:email" },
  async ({ email }: { email: string }): Promise<{ success: boolean; }> => {
    await UserService.tempUpdateDiamondByEmail(email);
    return { success: true, };
  }
);

// export const createAgent = api(
//   { expose: true, method: "PATCH", path: "/make/agent/:userId" },
//   async ({ userId }: { userId: string }): Promise<ISuccess> => {
//     await UserService.makeAgent(userId);
//     return { success: true, message: "User has been upgraded to agent Successfully." };
//   }
// );

// export const removeAgent = api(
//   { expose: true, method: "DELETE", path: "/remove/agent/:userId" },
//   async ({ userId }: { userId: string }): Promise<ISuccess> => {
//     await UserService.removeAgent(userId);
//     return { success: true, message: "User has been remove as agent Successfully." };
//   }
// );


// API to update the regNumber of a user
export const updateRegNumber = api(
  { expose: true, method: "PATCH", path: "/user/:userId/reg-number" },
  async ({ userId, newRegNumber }: { userId: string; newRegNumber: number }): Promise<UpdateRegNoResponse> => {
    const updatedUser = await UserService.updateRegNumber(userId, newRegNumber);
    return { success: true, data: updatedUser };
  }
);

// API to list all conversation user of given registration number user
export const fetchAllConversationListOfGivenRegNo = api(
  { expose: true, method: "GET", path: "/users/conversation-list/:regNo" },
  async ({ regNo }: { regNo: number; }): Promise<IFetchAllConversationListResponse> => {
    const data = await UserService.fetchAllConversationListOfGivenRegNo(regNo);
    return {
      success: true,
      data
    };
  }
);

// API to list top 5 gifter
export const fetchTopFiveGifter = api(
  { expose: true, method: "GET", path: "/users/top-five/gifter" },
  async (): Promise<TopFiveGifterResponse> => {
    const data = await UserService.fetchTopFiveGifter();
    return { success: true, data };
  }
);

// API to create an admin user
// This is a one-time operation to seed the admin user
export const createAdminUser = api(
  { expose: true, method: "GET", path: "/admin/user/create" },
  async (): Promise<{ success: true }> => {
    await seedAdminUser()
    return { success: true };
  }
);



// API to remove purchase
export const removePurchase = api(
  { expose: true, method: "DELETE", path: "/admin/remove-purchase/:userId/:name" },
  async (data: { userId: string, name: string }): Promise<{ success: true }> => {
    await UserService.removePurchase(
      data.userId,
      data.name
    );
    return { success: true };
  }
);

// API to transfer diamond from one user to another
export const transferDiamond = api(
  { expose: true, method: "PATCH", path: "/admin/transfer-diamond" },
  async (data: { fromUserId: string, toUserId: string, diamond: number }): Promise<{ success: true }> => {
    // Validate amount: must be a number and not negative
    if (typeof data.diamond !== "number" || Number.isNaN(data.diamond) || data.diamond < 0) {
      throw APIError.invalidArgument("Diamond must be a non-negative number");
    }
    await UserService.transferDiamondWithoutHistory(data);
    return { success: true };
  }
);

// status ="add" | "subtract"
export const addRemoveDiamondFromOrToUserWithoutHistory = api(
  { expose: true, method: "PATCH", path: "/add-remove-diamond/:status/:userId" },
  async (data: { userId: string, diamond: number, status: string }): Promise<{
    success: true
  }> => {
    // Validate amount: must be a number and not negative
    if (typeof data.diamond !== "number" || Number.isNaN(data.diamond) || data.diamond < 0) {
      throw APIError.invalidArgument("Diamond must be a non-negative number");
    }
    await UserService.addRemoveDiamondFromOrToUserWithoutHistory(data);
    return { success: true };
  }
);