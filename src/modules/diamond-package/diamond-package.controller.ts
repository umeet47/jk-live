import { api } from "encore.dev/api";
import DiamondPackageService from "./diamond-package.service";
import {
  CreateDiamondPackageDto,
  CreateDiamondPackageResponse,
  FetchDiamondPackageListResponse,
  RemoveDiamondPackageResponse
} from "./diamond-package.interface";
/**
 *  Method to create new diamond package
 */
export const createNewDiamondPackage = api(
  { expose: true, auth: true, method: "POST", path: "/diamond-package" },
  async (data: CreateDiamondPackageDto): Promise<CreateDiamondPackageResponse> => {
    // try {
    const result = await DiamondPackageService.createNewDiamondPackage(data);
    return { success: true, data: result };
    // } catch (error) {
    //   throw APIError.aborted(
    //     error?.toString() || "Error creating new diamond package"
    //   );
    // }
  }
);

/**
 *  Method to remove diamond package
 */
export const removeDiamondPackage = api(
  { expose: true, auth: true, method: "DELETE", path: "/diamond-package/:id" },
  async ({ id }: { id: string }): Promise<RemoveDiamondPackageResponse> => {
    // try {
    await DiamondPackageService.removeDiamondPackage(id);
    return { success: true };
    // } catch (error) {
    //   throw APIError.aborted(
    //     error?.toString() || "Error removing diamond package"
    //   );
    // }
  }
);

/**
 *  Method to fetch all diamond package
 */
export const fetchAllDiamondPackage = api(
  { expose: true, method: "GET", path: "/diamond-package" },
  async (): Promise<FetchDiamondPackageListResponse> => {
    // try {
    const result = await DiamondPackageService.findAllDiamondPackage();
    return { success: true, data: result };
    // } catch (error) {
    //   throw APIError.aborted(
    //     error?.toString() || "Error fetching all diamond package"
    //   );
    // }
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
