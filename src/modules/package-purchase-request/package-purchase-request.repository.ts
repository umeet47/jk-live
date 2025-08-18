import { Prisma } from "@prisma/client";
import { prisma } from "../../common/database";

const PackagePurchaseRequestRepository = {
    // Create a new PackagePurchaseRequest
    create: async (data: Prisma.PackagePurchaseRequestUncheckedCreateInput) => {
        return prisma.packagePurchaseRequest.create({ data });
    },

    // Update a PackagePurchaseRequest
    updateRequest: async (id: string, data: Prisma.PackagePurchaseRequestUncheckedUpdateInput) => {
        return prisma.packagePurchaseRequest.update({
            where: { id },
            data,
        });
    },

    // Update the status of a PackagePurchaseRequest
    updateStatus: async (id: string, status: string) => {
        return prisma.packagePurchaseRequest.update({
            where: { id },
            data: { status },
        });
    },

    fetchAllList: async () => {
        return prisma.packagePurchaseRequest.findMany({
            include: {
                user: { include: { ActivePackage: true, ActiveAnimation: true, ActiveProfileFrame: true } },
                vipSubPackage: true
            }
        });
    },
    // Find a PackagePurchaseRequest by ID
    findById: async (id: string) => {
        return prisma.packagePurchaseRequest.findUnique({
            where: { id }, include: {
                vipSubPackage: {
                    include: { VipPackage: true }
                }
            }
        });
    },
    findOneByUserId: async (userId: string) => {
        return prisma.packagePurchaseRequest.findFirst({
            where: { userId },
        });
    }
};

export default PackagePurchaseRequestRepository;