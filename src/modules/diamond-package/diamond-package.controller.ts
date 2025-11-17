import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import {
  CreateDiamondPackageDto,
  CreateDiamondPackageResponse,
  FetchDiamondPackageListResponse,
  RemoveDiamondPackageResponse
} from "./diamond-package.interface";
import DiamondPackageService from "./diamond-package.service";
/**
 *  Method to create new diamond package
 */
export const createNewDiamondPackage = api(
  { expose: true, auth: true, method: "POST", path: "/diamond-package" },
  async (data: CreateDiamondPackageDto): Promise<CreateDiamondPackageResponse> => {
    const role = getAuthData()!.role
    if (role !== "ADMIN") {
      throw APIError.permissionDenied("Only Admin is allowed")
    }
    const result = await DiamondPackageService.createNewDiamondPackage(data);
    return { success: true, data: result };
  }
);

/**
 *  Method to remove diamond package
 */
export const removeDiamondPackage = api(
  { expose: true, auth: true, method: "DELETE", path: "/diamond-package/:id" },
  async ({ id }: { id: string }): Promise<RemoveDiamondPackageResponse> => {
    const role = getAuthData()!.role
    if (role !== "ADMIN") {
      throw APIError.permissionDenied("Only Admin is allowed")
    }
    await DiamondPackageService.removeDiamondPackage(id);
    return { success: true };
  }
);

/**
 *  Method to fetch all diamond package
 */
export const fetchAllDiamondPackage = api(
  { expose: true, auth: true, method: "GET", path: "/diamond-package" },
  async (): Promise<FetchDiamondPackageListResponse> => {
    const result = await DiamondPackageService.findAllDiamondPackage();
    return { success: true, data: result };
  }
);

// /**
//  * Method to update the level of given user account
//  */
// export const updateDiamondLevel = api(
//   { expose: true, auth: true, method: "PATCH", path: "/diamond/level/:id" },
//   async ({ id }: { id: string }) => {
//     try {
//       log.info("id", id);
//     } catch (error) {
//       throw APIError.aborted(
//         error?.toString() || "Error updating the user diamond level"
//       );
//     }
//   }
// );
// /**
//  * Method to Add the diamond to send history
//  */
// export const addSendHistory = api(
//   { expose: true, auth: true, method: "POST", path: "/diamond/history" },
//   async ({ id, diamond }: { id: string; diamond: number }) => {
//     try {
//       log.info("id", id);
//       log.info("diamond", diamond);
//     } catch (error) {
//       throw APIError.aborted(
//         error?.toString() || "Error adding the diamond to send history"
//       );
//     }
//   }
// );
// /**
//  * Method to fetch the send diamond history
//  */
// export const fetchSendHistory = api(
//   { expose: true, auth: true, method: "GET", path: "/diamond/history" },
//   async () => {
//     try {
//       log.info("fetched");
//     } catch (error) {
//       throw APIError.aborted(
//         error?.toString() || "Error fetching all the send diamond history"
//       );
//     }
//   }
// );
// /**
//  * Method to Remove the send diamond history
//  */
// export const removeAllSendHistory = api(
//   { expose: true, auth: true, method: "DELETE", path: "/diamond/history" },
//   async () => {
//     try {
//       log.info("removed");
//     } catch (error) {
//       throw APIError.aborted(
//         error?.toString() || "Error Removing all the send diamond history"
//       );
//     }
//   }
// );
