import { Prisma } from "@prisma/client";
import { prisma, prismaWithoutExtend } from "../../common/database";

import { DiamondHistoryPayload } from "./user.interface";
import log from "encore.dev/log";
import { APIError } from "encore.dev/api";
import { Pagination } from "../../common/interface";
import DiamondSendPercentageService from "../diamond-send-percentage/diamond-send-percentage.service";

const UserRepository = {
  // Fetch the highest regNumber
  getHighestRegNumber: async () => {
    const result = await prisma.user.findFirst({
      orderBy: {
        regNumber: "desc", // Sort by regNumber in descending order
      },
      select: {
        regNumber: true, // Only fetch the regNumber field
      },
    });
    return result?.regNumber || null; // Return the highest regNumber or null if no users exist
  },

  findByRegNo: async (regNo: number) => {
    return prisma.user.findFirst({
      where: { regNumber: regNo },
      include: {
        ActivePackage: true,
        ActiveAnimation: true,
        ActiveProfileFrame: true
      }
    });
  },
  findByRegNoWithLimitedData: async (regNo: number) => {
    return prisma.user.findFirst({
      where: { regNumber: regNo },
      select: {
        id: true,
        fullname: true,
        profilePic: true
      }
    });
  },
  // Fetch all users who have chatted with the given user
  fetchAllConversationAssociatedListByUserId: async (userId: string) => {
    return prisma.p2PMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      select: {
        senderId: true,
        receiverId: true,
        MessageSender: {
          select: {
            id: true,
            fullname: true,
            profilePic: true,
          },
        },
        MessageReceiver: {
          select: {
            id: true,
            fullname: true,
            profilePic: true,
          },
        },
      },
    });
  },

  findByUserId: async (id: string) => {
    return prisma.user.findFirst({
      where: { id },
      include: {
        ActivePackage: true,
        ActiveAnimation: true,
        ActiveProfileFrame: true
      }
    });
  },
  removeAnimationFromUser: async (id: string) => {
    await prisma.animationPurchase.deleteMany({
      where: {
        User: {
          id
        }
      }
    });

    // return prisma.user.update({
    //   where: { id },
    //   data: { ActiveAnimation: { disconnect: true } },
    //   include: {
    //     ActivePackage: true,
    //     ActiveAnimation: true,
    //     ActiveProfileFrame: true
    //   }
    // });
  },
  removeProfileFrameFromUser: async (id: string) => {
    await prisma.profileFramePurchase.deleteMany({
      where: {
        User: {
          id
        }
      }
    });
    // return prisma.user.update({
    //   where: { id },
    //   data: { ActiveProfileFrame: { disconnect: true } },
    //   include: {
    //     ActivePackage: true,
    //     ActiveAnimation: true,
    //     ActiveProfileFrame: true
    //   }
    // });
  },
  removeVipPackageFromUser: async (id: string) => {
    await prisma.packagePurchase.deleteMany({
      where: {
        User: {
          id
        }
      }
    });
    // return prisma.user.update({
    //   where: { id },
    //   data: { ActivePackage: { disconnect: true } },
    // });
  },
  findByUserIdWithActiveData: async (id: string) => {
    return prisma.user.findFirst({
      where: { id },
      include: {
        ActivePackage: true,
        ActiveAnimation: true,
        ActiveProfileFrame: true,
      }
    });
  },
  findByUserIdWithActiveDataAndDevice: async (id: string) => {
    return prisma.user.findFirst({
      where: { id },
      include: {
        ActivePackage: true,
        ActiveAnimation: true,
        ActiveProfileFrame: true,
      }
    });
  },


  findByRegNoWithActiveData: async (regNumber: number) => {
    return prisma.user.findFirst({
      where: { regNumber },
      include: {
        ActivePackage: true,
        ActiveAnimation: true,
        ActiveProfileFrame: true
      }
    });
  },

  findOneWithFollower: async (id: string) => {
    return prisma.user.findFirst({ where: { id }, include: { Followers: true } });
  },
  findOneWithFollowing: async (id: string) => {
    return prisma.user.findFirst({ where: { id }, include: { Following: true } });
  },
  findByIdsWithLastMessage: async (ids: string[], currentUserId: string) => {
    return prisma.user.findMany({ where: { id: { in: ids }, }, include: { P2PReceiver: true, P2PSender: true } });
  },
  findByEmail: (email: string) => {
    return prisma.user.findFirst({ where: { email }, include: { ActivePackage: true } });
  },
  findByEmailWithActiveData: (email: string) => {
    return prisma.user.findFirst({
      where: { email },
      include: {
        ActivePackage: true,
        ActiveAnimation: true,
        ActiveProfileFrame: true
      }
    });
  },
  totalUserCount: async () => {
    return prisma.user.count();
  },
  findAllWithPagination: async ({ take, skip }: Pagination) => {
    return prisma.user.findMany({
      take, skip, include: {
        ActivePackage: true,
        ActiveAnimation: true,
        ActiveProfileFrame: true,
      },
      orderBy: { regNumber: "asc" }
    });
  },
  findAll: async () => {
    return prisma.user.findMany();
  },
  createUser: async (data: Prisma.UserCreateInput) => {
    const result = await prisma.user.findFirst({
      orderBy: {
        regNumber: "desc", // Sort by regNumber in descending order
      },
      select: {
        regNumber: true, // Only fetch the regNumber field
      },
    });
    // const highestRegNumber = await UserRepository.getHighestRegNumber();
    const highestRegNumber = result?.regNumber || null; // Return the highest regNumber or null if no users exist
    const defaultRegNumber = parseInt(process.env.DEFAULT_REG_NUMBER || "1", 10);

    const nextRegNumber = highestRegNumber ? highestRegNumber + 1 : defaultRegNumber;

    return prisma.user.create({
      data: {
        ...data,
        regNumber: nextRegNumber
      },
      include: {
        ActivePackage: true,
        ActiveAnimation: true,
        ActiveProfileFrame: true
      }
    });
  },
  tempUpdateDiamond: (id: string) => {
    return prisma.user.update({ where: { id }, data: { diamond: 100000 } })
  },
  updateDiamonds: async (
    amount: number,
    receiverId: string,
    senderId: string,
    diamondSendPercentage: {
      percentage: number;
      subtractFrom: string;
    }) => {
    try {
      return await prisma.$transaction(async (tx) => {
        const receiver = await tx.user.findFirst({ where: { id: receiverId } })
        if (!receiver) {
          throw APIError.notFound("Receiver not found");
        }
        const sender = await tx.user.findFirst({ where: { id: senderId } })
        if (!sender) {
          throw APIError.notFound("Sender not found");
        }
        // const diamondSendPercentage = await DiamondSendPercentageService.findOne();;
        const multiplier = Number(diamondSendPercentage.percentage);
        const diamondBonus = amount * multiplier / 100;
        if (diamondSendPercentage.subtractFrom === "sender") {
          sender.diamond = sender.diamond - amount - diamondBonus;
          sender.diamondLevel = sender.diamondLevel + amount + diamondBonus;
          receiver.diamond = receiver.diamond + amount
        } else {
          sender.diamond = sender.diamond - amount
          sender.diamondLevel = sender.diamondLevel + amount
          receiver.diamond = receiver.diamond + amount - diamondBonus;
        }
        await tx.user.update({ where: { id: receiverId }, data: receiver })
        await tx.user.update({ where: { id: senderId }, data: sender })
        await tx.giftHistory.create({
          data: {
            diamond: amount,
            diamondBonus,
            senderId
          }
        })
      });
    } catch (error) {
      log.error("Error while trying to update diamond");
      throw error;
    }

  },
  subtractDiamondsAndUpdateDiamondHistory: async (amount: number, id: string, diamondHistoryData: DiamondHistoryPayload) => {
    try {
      return await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          data: { diamond: { decrement: amount } },
          where: { id },
          include: {
            ActivePackage: true,
            ActiveAnimation: true,
            ActiveProfileFrame: true
          }
        });
        await tx.diamondHistory.create({ data: diamondHistoryData });
        return user;
      });
    } catch (error) {
      log.error(
        "Error while trying to decrease the user diamond and store diamond history"
      );
      throw error;
    }
  },
  updateUser: async (data: Prisma.UserUncheckedUpdateInput, id: string) => {
    return await prisma.user.update({
      data,
      where: { id },
      include: {
        ActivePackage: true,
        ActiveAnimation: true,
        ActiveProfileFrame: true
      }
    });
  },
  updateUsers: async (data: { fromUserId: string, toUserId: string, fromUserDiamond: number; toUserDiamond: number }) => {
    return await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: data.fromUserId },
        data: { diamond: data.fromUserDiamond },
      });
      // Add diamond to receiver
      await tx.user.update({
        where: { id: data.toUserId },
        data: { diamond: data.toUserDiamond },
      });
    });
  },
  updateDiamond: async (diamond: number, id: string) => {
    return await prisma.user.update({
      data: { diamond },
      where: { id }
    });
  },
  updateUserAndUpdateDiamondHistory: async (amount: number, id: string,
    diamondHistoryData: DiamondHistoryPayload
  ) => {
    try {
      return await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          data: { diamond: { increment: amount } },
          where: { id },
          include: {
            ActivePackage: true,
            ActiveAnimation: true,
            ActiveProfileFrame: true
          }
        });
        await tx.diamondHistory.create({ data: diamondHistoryData });
        return user;
      });
    } catch (error) {
      log.error(
        "Error while trying to update the user diamond and diamond history"
      );
      throw error;
    }
  },
  remove: async (id: string) => {
    return prisma.user.delete({ where: { id } });
  },
  findByUserEmailWithPassword: async (email: string) => {
    return prismaWithoutExtend.user.findFirst({
      where: { email },
      include: {
        ActivePackage: true,
        ActiveAnimation: true,
        ActiveProfileFrame: true
      },
    });
  },
  // Update the regNumber of a user
  updateRegNumber: async (userId: string, newRegNumber: number) => {
    return prisma.user.update({
      where: { id: userId },
      data: { regNumber: newRegNumber },
      include: {
        ActivePackage: true,
        ActiveAnimation: true,
        ActiveProfileFrame: true
      }
    });
  },

  // Check if a regNumber is already in use
  isRegNumberInUse: async (regNumber: number) => {
    const user = await prisma.user.findUnique({
      where: { regNumber },
    });
    return !!user;
  },
  fetchTopFiveGifter: async () => {
    return await prisma.user.findMany({
      include: {
        ActiveAnimation: true,
        ActivePackage: true,
        ActiveProfileFrame: true
      },
      orderBy: { diamondLevel: "desc" },
      skip: 0,
      take: 5
    })
  },
  updateUserDevice: async (userId: string, deviceId: string) => {
    return await prisma.user.update({
      where: { id: userId },
      data: { deviceId }
    })
  },
  getUserInfo: (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      select: {
        isHost: true,
      }
    })
  },
  getUserInfoWithAgencyData: (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      include: {
        ActiveAnimation: true,
        ActivePackage: true,
        ActiveProfileFrame: true,
        // HostRequestUser: {
        //   include: { agent: true }
        // }
      }
    })
  },
  getManyUserInfoWithAgencyData: (ids: string[]) => {
    return prisma.user.findMany({
      where: { id: { in: ids } },
      include: {
        ActiveAnimation: true,
        ActivePackage: true,
        ActiveProfileFrame: true,
        // HostRequestUser: {
        //   include: { agent: true }
        // }
      }
    })
  },
  // Find user by mobile number
  findByMobile: async (mobile: string) => {
    return prisma.user.findUnique({
      where: { mobile },
      include: {
        ActivePackage: true,
        ActiveAnimation: true,
        ActiveProfileFrame: true
      }
    });
  },
};

export default UserRepository;
