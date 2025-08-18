import { Prisma } from "@prisma/client";
import { prisma } from "../../common/database";

const DiamondSendPercentageRepository = {
  findById: async (id: string) => {
    return prisma.diamondSendPercentage.findUnique({
      where: { id },
    });
  },
  findFirst: () => {
    return prisma.diamondSendPercentage.findFirst();
  },
  create: async (data: Prisma.DiamondSendPercentageCreateInput) => {
    return prisma.diamondSendPercentage.create({ data });
  },
  update: async (    where: Prisma.DiamondSendPercentageWhereUniqueInput,    data: Prisma.DiamondSendPercentageUpdateInput  ) => {
   return prisma.diamondSendPercentage.update({
      where,
      data,
    });
  }
};

export default DiamondSendPercentageRepository;
