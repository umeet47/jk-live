export type Role = "USER" | "ADMIN" | "MODERATOR" | "RESELLER";
export type AccountType = "REGULAR" | "VIP" | "VVIP";
export enum REAL_UPDATE {
  SYSTEM_SETTING = "system-setting",
  DIAMOND_PACKAGE_ADDED = "diamond-package-added",
  DIAMOND_PACKAGE_REMOVED = "diamond-package-removed",
  USER_UPDATED = "user-updated",
  USER_COUNT = "user-count",
  ANIMATION_ADDED = "animation-added",
  ANIMATION_UPDATED = "animation-updated",
  ANIMATION_REMOVED = "animation-removed",
  PROFILE_FRAME_REMOVED = "profile-frame-removed",
  PROFILE_FRAME_ADDED = "profile-frame-added",

  MESSSAGE = "message",
  HOST_REQUEST = "host-request",
  HOST_REQUEST_RESPONSE = "host-request-response",
  DIAMOND_TRANSFER_BY_RESELLER = "diamond-transfer-by-reseller",
  WITHDRAW_REQUEST_RESPONSE = "withdraw-request-response",
  CUSTOM_WITHDRAW_REQUEST_RESPONSE = "custom-withdraw-request-response",

  NOTIFICATION = "notification",
  FOLLOW_NOTIFICATION = "follow-notification",
}
