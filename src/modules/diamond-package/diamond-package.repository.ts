import { Prisma } from "@prisma/client";
import { prisma } from "../../common/database";

const DiamondPackageRepository = {
  findById: (id: string) => {
    return prisma.diamondPackage.findUnique({ where: { id } });
  },
  findAll: async () => {
    return prisma.diamondPackage.findMany();
  },
  createNew: async (data: Prisma.DiamondPackageCreateInput) => {
    return prisma.diamondPackage.create({ data });
  },
  remove: async (id: string) => {
    return prisma.diamondPackage.delete({ where: { id } });
  },
};

export default DiamondPackageRepository;
