import { APIError } from "encore.dev/api";
import {
  CreateVipPackageDto,
  CreateVipSubPackageDto,
  UpdateVipPackageDto,
  UpdateVipSubPackageDto,
  VipPacakgeQueryDto,
} from "./vip-package.interface";
import VipPackageRepository from "./vip-package.repository";
import { Prisma } from "@prisma/client";
import UserService from "../users/user.service";

const VipPackageService = {
  createVipPackage: async (data: CreateVipPackageDto) => {
    return await VipPackageRepository.createNewVipPackage(data);
  },

  updateVipPackage: async (id: string, data: UpdateVipPackageDto) => {
    return await VipPackageRepository.updateVipPackage(id, data);
  },

  removeVipPackage: async (id: string) => {
    const vipPackage = await VipPackageRepository.findById(id);
    if (!vipPackage) {
      throw APIError.notFound("Vip Package not found");
    }
    return await VipPackageRepository.remove(id);
  },

  findVipPackageById: async (id: string) => {
    const vipPackage = await VipPackageRepository.findVipPackageById(id);
    if (!vipPackage) {
      throw APIError.notFound("Vip Package not found");
    }
    return vipPackage;
  },

  fetchAll: async (data: VipPacakgeQueryDto) => {
    const filtered: Prisma.VipPackageWhereInput = {};
    if (data.type) {
      filtered.type = data.type;
    }
    return await VipPackageRepository.fetchListWithFilter(filtered);
  },

  createVipSubPackage: async (data: CreateVipSubPackageDto) => {
    return await VipPackageRepository.createVipSubPackage(data);
  },
  updateVipSubPackage: async (id: string, data: UpdateVipSubPackageDto) => {
    return await VipPackageRepository.updateVipSubPackage(id, data);
  },
  deleteVipSubPackage: async (id: string) => {
    return await VipPackageRepository.deleteVipSubPackage(id);
  },
  findVipSubPackageById: async (id: string) => {
    const vipSubPackage = await VipPackageRepository.findVipSubPackageById(id);

    if (!vipSubPackage) {
      throw APIError.notFound("Vip Sub Package not found");
    }
    return vipSubPackage;
  },
  findAllVipSubPackages: async () => {
    return await VipPackageRepository.findAllVipSubPackages();
  },
  buyVipSubPackage: async (userId: string, vipSubPackageId: string) => {
    const user = await UserService.findOne(userId)
    if (!user) {
      throw APIError.notFound("User not found");
    }

    const vipSubPackage = await VipPackageRepository.findVipSubPackageByIdWithVipPackage(vipSubPackageId);
    if (!vipSubPackage) {
      throw APIError.notFound("Vip Sub Package not found");
    }

    if (vipSubPackage.amount > user.diamond) {
      throw APIError.aborted("Not enough diamonds on user account to buy the given VIP sub package");
    }


    // Calculate expiry date
    const purchaseDate = new Date();
    const expiryDate = new Date(purchaseDate);
    expiryDate.setDate(purchaseDate.getDate() + vipSubPackage.validity);

    const payload: Prisma.PackagePurchaseCreateInput = {
      validity: vipSubPackage.validity,
      amount: vipSubPackage.amount,
      entryAnimation: vipSubPackage.entryAnimation,
      imageUrl: vipSubPackage.imageUrl,
      name: vipSubPackage.name,
      type: vipSubPackage.VipPackage.type,
      purchaseDate,
      expiryDate,
    };

    return await VipPackageRepository.buyVipSubPackage(user, payload);
  }
};
export default VipPackageService;
