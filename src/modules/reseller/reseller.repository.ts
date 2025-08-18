import { APIError } from "encore.dev/api";
import { prisma } from "../../common/database";

const ResellerRepository = {
    // Update isReseller flag to true by regNo
    makeReseller: async (regNo: number) => {
        return prisma.user.update({
            where: { regNumber: regNo },
            data: { isReseller: true },
        });
    },

    // Update isReseller flag to false by regNo
    removeReseller: async (regNo: number) => {
        return prisma.user.update({
            where: { regNumber: regNo },
            data: { isReseller: false },
        });
    },

    // List all resellers
    listResellers: async () => {
        return prisma.user.findMany({
            where: { isReseller: true },
            include: { ActivePackage: true, ActiveAnimation: true, ActiveProfileFrame: true },
        });
    },

    transferDiamonds: async (senderId: string, receiverId: string, diamond: number) => {
        // Perform the diamond transfer in a transaction
        return prisma.$transaction(async (tx) => {
            // Subtract diamonds from the sender
            const sender = await tx.user.update({
                where: { id: senderId },
                data: { diamond: { decrement: diamond } },
            });

            if (sender.diamond < 0) {
                throw APIError.aborted("Insufficient diamonds in sender's account.");
            }

            // Add diamonds to the receiver
            const receiver = await tx.user.update({
                where: { id: receiverId },
                data: { diamond: { increment: diamond } },
            });

            // Create a diamond transfer record
            const resellerHistory = await tx.resellerHistory.create({
                data: {
                    senderId,
                    receiverId,
                    diamond,
                },
            });

            return { sender, receiver, resellerHistory };
        });
    },

    // Fetch reseller transaction history
    getResellerHistory: async (resellerId: string) => {
        return prisma.resellerHistory.findMany({
            where: { senderId: resellerId },
            orderBy: { createdAt: "desc" }, // Order by most recent transactions
            include: {
                Receiver: {
                    include: { ActivePackage: true, ActiveAnimation: true, ActiveProfileFrame: true }
                },
            },
        });
    },
};

export default ResellerRepository;