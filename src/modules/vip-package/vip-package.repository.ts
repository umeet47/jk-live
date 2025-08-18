import { Prisma } from "@prisma/client";
import { prisma } from "../../common/database";
import { UserDto } from "../users/user.interface";

const VipPackageRepository = {
  createNewVipPackage: async (data: Prisma.VipPackageCreateInput) => {
    return prisma.vipPackage.create({ data });
  },
  updateVipPackage: async (id: string, data: Prisma.VipPackageUpdateInput) => {
    return prisma.vipPackage.update({ where: { id }, data });
  },
  remove: async (id: string) => {
    return prisma.vipPackage.delete({ where: { id } });
  },
  findById: async (id: string) => {
    return prisma.vipPackage.findUnique({ where: { id } });
  },
  findVipPackageById: async (id: string) => {
    return prisma.vipPackage.findUnique({ where: { id }, include: { VipSubPackages: true } });
  },
  fetchListWithFilter: async (filtered: Prisma.VipPackageWhereInput) => {
    return prisma.vipPackage.findMany({ where: filtered, include: { VipSubPackages: true } });
  },

  createVipSubPackage: async (data: Prisma.VipSubPackageUncheckedCreateInput) => {
    return prisma.vipSubPackage.create({ data });
  },
  updateVipSubPackage: async (id: string, data: Prisma.VipSubPackageUpdateInput) => {
    return prisma.vipSubPackage.update({ where: { id }, data });
  },
  deleteVipSubPackage: async (id: string) => {
    return prisma.vipSubPackage.delete({ where: { id } });
  },
  findVipSubPackageById: async (id: string) => {
    return prisma.vipSubPackage.findUnique({ where: { id } });
  },
  findVipSubPackageByIdWithVipPackage: async (id: string) => {
    return prisma.vipSubPackage.findUnique({ where: { id }, include: { VipPackage: true } });
  },
  findAllVipSubPackages: async () => {
    return prisma.vipSubPackage.findMany();
  },
  buyVipSubPackage: async (user: UserDto, packagePurchase: Prisma.PackagePurchaseCreateInput) => {
    return prisma.$transaction(async (tx) => {
      const existingActivePackage = user.ActivePackage;
      if (existingActivePackage) {
        // Optionally delete or update the existing profile frame
        await tx.packagePurchase.delete({
          where: { id: existingActivePackage.id },
        });
      }
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          diamond: { decrement: packagePurchase.amount },
          ActivePackage: {
            create: packagePurchase
          },
        },
        include: {
          ActivePackage: true,
          ActiveAnimation: true,
          ActiveProfileFrame: true
        }
      });

      return updatedUser;
    });
  }
};
export default VipPackageRepository;
