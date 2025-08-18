import { Prisma, ProfileFrame } from "@prisma/client";
import { prisma } from "../../common/database";
import { APIError } from "encore.dev/api";
import { UserDto } from "../users/user.interface";

const ProfileFrameRepository = {
  createNew: async (data: Prisma.ProfileFrameCreateInput) => {
    return prisma.profileFrame.create({ data });
  },
  remove: async (id: string) => {
    return prisma.profileFrame.delete({ where: { id } });
  },
  findById: async (id: string) => {
    return prisma.profileFrame.findUnique({ where: { id } });
  },
  findAll: async () => {
    return prisma.profileFrame.findMany();
  },
  buyProfileFrame: async (user: UserDto, profileFrame: ProfileFrame) => {
    try {
      return await prisma.$transaction(async (tx) => {
        // Check for existing active profile frame
        const existingProfileFrame = user.ActiveProfileFrame

        if (existingProfileFrame) {
          // Optionally delete or update the existing profile frame
          await tx.profileFramePurchase.delete({
            where: { id: existingProfileFrame.id },
          });
        }

        // Calculate expiry date
        const purchaseDate = new Date();
        const expiryDate = new Date(purchaseDate);
        expiryDate.setDate(purchaseDate.getDate() + profileFrame.validity);

        // Update user and create profile frame purchase
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            diamond: { decrement: profileFrame.amount },
            ActiveProfileFrame: {
              create: {
                name: profileFrame.name,
                amount: profileFrame.amount,
                validity: profileFrame.validity,
                imageUrl: profileFrame.imageUrl,
                purchaseDate,
                expiryDate,
              },
            },
          },
          include: {
            ActiveProfileFrame: true,
            ActiveAnimation: true,
            ActivePackage: true
          }, // Include the created profile frame in the response
        });

        return updatedUser;
      });
    } catch (error: unknown) {
      throw APIError.unknown(`Failed to purchase profile frame: ${error}`);
    }
  }
};
export default ProfileFrameRepository;
