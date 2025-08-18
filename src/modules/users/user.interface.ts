import { IsEmail } from "encore.dev/validate";
import { User } from "@prisma/client";
import { Paginated } from "../../common/interface";
import { MessageHistory } from "../realtime/interfaces/p2p-call.interface";

export interface ActivePackage {
  id: string;
  name: string;
  type: string; //VIP, VVIP
  validity: number; // Store validity in days, months, or years TODO can be change to days which can be converted to month or years
  amount: number;
  imageUrl: string;
  entryAnimation: string | null;
  purchaseDate: Date | null;    // When the package was purchased
  expiryDate: Date | null// When the package expires
  createdAt: Date;
  updatedAt: Date;
}
export interface ActiveAnimation {
  id: string;
  name: string;
  videoUrl: string;
  amount: number;
  validity: number; // Store validity in days, months, or years TODO can be change to days which can be converted to month or years
  purchaseDate: Date;// When the package was purchased
  expiryDate: Date | null; // When the package expires
  createdAt: Date;
  updatedAt: Date;

}
export interface ActiveProfileFrame {
  id: string;
  name: string
  imageUrl: string
  amount: number;
  validity: number; // Store validity in days, months, or years TODO can be change to days which can be converted to month or years
  purchaseDate: Date;// When the package was purchased
  expiryDate: Date | null; // When the package expires
  createdAt: Date;
  updatedAt: Date;
}

export interface UserBaseDto {
  /** ID of the user */
  id: string;
  /** Fullname of the user */
  fullname: string;
  /** Email of the user */
  email: string | null;
  /** Mobile Number of the user */
  mobile: string | null;
  /** Profile Picture of the user */
  profilePic: string | null;
  /** Password of the user */
  // password: string | null;
  /** Registered Number of the user */
  regNumber: number;
  /** Role of the user */
  role: string;
  /** Account Type of the user */
  accountType: string;
  /** Subscribe Package Id of the user */
  activePackageId: string | null;
  /** Subscribe Animation Package Id of the user */
  activeAnimationId: string | null;
  /** Total Number of Diamond of the user */
  diamond: number;
  /** Level of Diamond of the user */
  diamondLevel: number;
  /**Diamond send blocked */
  isDiamondBlocked: boolean;
  /**Account login blocked */
  isAccountBlocked: boolean;
  isAgent: boolean;
  isModerator: boolean;
  isHost: boolean;
  isReseller: boolean;
  deviceId: string | null;
  /** Created At*/
  createdAt: Date;
  /** Updated At*/
  updatedAt: Date;
}

export interface UserWithFollower extends UserBaseDto {
  Followers: UserBaseDto[]
}

export interface UserWithFollowing extends UserBaseDto {
  Following: UserBaseDto[]
}

export interface UserDto extends UserBaseDto {
  ActivePackage: ActivePackage | null
  ActiveAnimation: ActiveAnimation | null
  ActiveProfileFrame: ActiveProfileFrame | null
}
export interface DeviceDto {
  id: number
  deviceId: string
  isBlocked: boolean
  createdAt: Date;
  updatedAt: Date;
}
export interface UserWithDevicesDto extends UserDto {
  Devices: DeviceDto[]
}
export interface UserWithTotalDuration extends UserDto {
  totalDuration: number;
}
export interface UserWithDeviceDataDto extends UserDto {
}

export interface UserWithPackagePurchase extends User {
  ActivePackage: ActivePackage | null
  ActiveAnimation: ActiveAnimation | null
  ActiveProfileFrame: ActiveProfileFrame | null
}

export interface UserWithLastMessageDto extends UserDto {
  lastMessage: MessageHistory | null;
  isOnline: boolean;
  unseenCount: number;
}
export interface UserWithLastMessageOnlyDto extends UserDto {
  lastMessage: MessageHistory | null;
}
export interface CreateUserDto {
  /** Fullname of the user */
  fullname: string;
  /** Email of the user */
  email: string & IsEmail;
  /**  Password of the user*/
  password: string;
}

export interface GoogleDto {
  token: string;
  deviceId: string;
}

export interface LoginUserDto {
  /** Email of the user */
  email: string;
  /**  Password of the user*/
  password: string;
  /**  DeviceId of the user*/
  deviceId: string;
}

export interface UpdateUserDto {
  /** Fullname of the user */
  fullname?: string;
  /** Mobile of the user */
  // mobile?: string;
  profilePic?: string;
  isDiamondBlocked?: boolean;
  isAccountBlocked?: boolean;
}

export interface UserResponse {
  /** Indicates if the request was successful */
  success: boolean;
  /** Error message if the request was not successful */
  /** User data */
  result: UserDto;
}
export interface UserWithActiveDataResponse {
  /** Indicates if the request was successful */
  success: boolean;
  /** Error message if the request was not successful */
  /** User data */
  result: UserDto;
}
export interface UserWithActiveDataAndDevicesResponse {
  /** Indicates if the request was successful */
  success: boolean;
  /** Error message if the request was not successful */
  /** User data */
  result: UserWithDevicesDto;
}
export interface UserWithPaginationResponse {
  /** Indicates if the request was successful */
  success: boolean;
  /** User data */
  result: UserDto[];
  /** Pagination data */
  pagination: Paginated;
}

export interface UserListResponse {
  /** Indicates if the request was successful */
  success: boolean;
  /** User data */
  result: UserDto[];
}

export interface LoginDto {
  accessToken: string;
  refreshToken: string;
  data: UserDto;
}

export interface UserLoginResponse {
  /** Indicates if the request was successful */
  success: boolean;
  /** Error message if the request was not successful */
  message?: string;
  result?: LoginDto;
}

export interface TokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface UserWithPagination {
  result: UserWithDeviceDataDto[];
  pagination: Paginated;
}

export interface AddDiamondDto {
  diamond: number;
}

export interface RemoveDiamondDto {
  diamond: number;
}

export type diamondHistoryType = "add" | "remove";

export interface DiamondHistoryPayload {
  diamond: number;
  userId: string;
  type: diamondHistoryType;
  handlerId: string;
}

export interface MakeAgentDto {
  userId: string
}
export interface ISuccess {
  message: string
  success: boolean
}

export interface UpdateRegNoResponse {
  success: boolean;
  data: UserDto
}

export interface UserInfo {
  id: string;
  fullname: string;
  profilePic: string | null;
}

export interface IFetchAllConversationListResponse {
  success: boolean;
  data: {
    searchUserDetail: UserInfo
    conversationUsers: UserInfo[]
  }
}

export interface TopFiveGifterResponse {
  success: boolean;
  data: UserDto[];
}

export interface loginWithMobileDto {
  mobileNumber: string;
  password: string;
  deviceId: string;

}