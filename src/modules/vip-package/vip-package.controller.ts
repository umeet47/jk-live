import { api } from "encore.dev/api";
import {
  BuyVipSubPackageResponse,
  CreateVipPackageDto,
  CreateVipSubPackageDto,
  UpdateVipPackageDto,
  UpdateVipSubPackageDto,
  VipPacakgeQueryDto,
  VipPackageResponse,
  VipPackageResponseWithSubPackage,
  VipSubPackageResponse,
} from "./vip-package.interface";
import VipPackageService from "./vip-package.service";

/**
 * Create new Vip Package
 */
export const createVipPackage = api(
  { expose: true, auth: true, method: "POST", path: "/vip-package" },
  async (data: CreateVipPackageDto): Promise<VipPackageResponse> => {
    const result = await VipPackageService.createVipPackage(data);
    return { success: true, result };
  }
);

/**
 * Update existing Vip Package
 */
export const updateVipPackage = api(
  { expose: true, auth: true, method: "PATCH", path: "/vip-package" },
  async ({ id, ...data }: { id: string } & UpdateVipPackageDto): Promise<VipPackageResponse> => {
    // try {
    const result = await VipPackageService.updateVipPackage(id, data);
    return { success: true, result };
    // } catch (error) {
    //   throw APIError.aborted(
    //     error?.toString() || "Error updating existing vip package"
    //   );
    // }
  }
);

/**
 * Remove given Vip Package
 */
export const removeVipPackage = api(
  { expose: true, auth: true, method: "DELETE", path: "/vip-package/:id" },
  async ({ id }: { id: string }): Promise<VipPackageResponse> => {
    await VipPackageService.removeVipPackage(id);
    return { success: true };
  }
);


/**
 * Fetch Vip Package with vipSubPackage data
 */
export const fetchVipPackage = api(
  { expose: true, auth: true, method: "GET", path: "/vip-package/:id" },
  async ({ id }: { id: string }): Promise<VipPackageResponseWithSubPackage> => {
    const result = await VipPackageService.findVipPackageById(id);
    return { success: true, result };
  }
);

/**
 * Fetch all Vip Package based on provided filter
 */
export const fetchAll = api(
  { expose: true, auth: true, method: "GET", path: "/vip-package" },
  async (data: VipPacakgeQueryDto): Promise<VipPackageResponse> => {
    const result = await VipPackageService.fetchAll(data);
    return { success: true, result };
  }
);


// Create a new VipSubPackage
export const createVipSubPackage = api(
  { expose: true, auth: true, method: "POST", path: "/vip-subpackage" },
  async (data: CreateVipSubPackageDto): Promise<VipSubPackageResponse> => {
    const result = await VipPackageService.createVipSubPackage(data);
    return { success: true, result };
  }
);

// Update an existing VipSubPackage
export const updateVipSubPackage = api(
  { expose: true, auth: true, method: "PATCH", path: "/vip-subpackage/:id" },
  async ({ id, ...data }: { id: string } & UpdateVipSubPackageDto): Promise<VipSubPackageResponse> => {
    const result = await VipPackageService.updateVipSubPackage(id, data);
    return { success: true, result };
  }
);

// Delete a VipSubPackage
export const deleteVipSubPackage = api(
  { expose: true, auth: true, method: "DELETE", path: "/vip-subpackage/:id" },
  async ({ id }: { id: string }): Promise<{ success: boolean }> => {
    await VipPackageService.deleteVipSubPackage(id);
    return { success: true };
  }
);

// Fetch all VipSubPackages
export const fetchAllVipSubPackages = api(
  { expose: true, auth: true, method: "GET", path: "/vip-subpackage" },
  async (): Promise<VipSubPackageResponse> => {
    const result = await VipPackageService.findAllVipSubPackages();
    return { success: true, result };
  }
);

// Fetch a single VipSubPackage by ID
export const fetchVipSubPackageById = api(
  { expose: true, auth: true, method: "GET", path: "/vip-subpackage/:id" },
  async ({ id }: { id: string }): Promise<VipSubPackageResponse> => {
    const result = await VipPackageService.findVipSubPackageById(id);
    return { success: true, result };
  }
);

// buy vip sub package with diamond
export const buyVipSubPackage = api(
  { expose: true, auth: true, method: "POST", path: "/vip-subpackage/buy" },
  async ({ userId, vipSubPackageId }: { userId: string; vipSubPackageId: string }): Promise<BuyVipSubPackageResponse> => {
    const result = await VipPackageService.buyVipSubPackage(userId, vipSubPackageId);
    return { success: true, data: result };
  }
);