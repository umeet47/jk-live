import { Animation, Prisma } from "@prisma/client";
import { APIError } from "encore.dev/api";
import { UserDto } from "../users/user.interface";
import { prisma } from "../../common/database";

const AnimationRepository = {
  createNew: async (data: Prisma.AnimationCreateInput) => {
    return prisma.animation.create({ data });
  },
  // update: async (data: Prisma.AnimationUpdateInput, id: string) => {
  //   return prisma.animation.update({ where: { id }, data });
  // },
  remove: async (id: string) => {
    return prisma.animation.delete({ where: { id } });
  },
  findById: async (id: string) => {
    return prisma.animation.findUnique({ where: { id } });
  },
  findAll: async () => {
    return prisma.animation.findMany();
  },
  buyAnimation: async (user: UserDto, animation: Animation) => {
    try {
      return await prisma.$transaction(async (tx) => {
        // Check for existing active animation
        const existingAnimation = user.ActiveAnimation

        if (existingAnimation) {
          // Optionally delete or update the existing animation
          await tx.animationPurchase.delete({
            where: { id: existingAnimation?.id },
          });
        }

        // Calculate expiry date
        const purchaseDate = new Date();
        const expiryDate = new Date(purchaseDate);
        expiryDate.setDate(purchaseDate.getDate() + animation.validity);

        // Update user and create profile frame purchase
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            diamond: { decrement: animation.amount },
            ActiveAnimation: {
              create: {
                name: animation.name,
                amount: animation.amount,
                validity: animation.validity,
                videoUrl: animation.videoUrl,
                purchaseDate,
                expiryDate,
              },
            },
          },
          include: {
            ActiveProfileFrame: true,
            ActiveAnimation: true,
            ActivePackage: true
          }, // Include the created animation in the response
        });

        return updatedUser;
      });
    } catch (error: unknown) {
      throw APIError.unknown(`Failed to purchase animation: ${error}`);
    }
  }
};
export default AnimationRepository;
