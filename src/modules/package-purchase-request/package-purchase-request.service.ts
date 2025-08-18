import { Prisma } from "@prisma/client";
import PackagePurchaseRequestRepository from "./package-purchase-request.repository";
import { prisma } from "../../common/database";
import { CreatePackagePurchaseRequestDto } from "./package-purchase-request.interface";
import { APIError } from "encore.dev/api";

const PackagePurchaseRequestService = {
    // Create a new PackagePurchaseRequest
    createRequest: async ({ paymentType, sendingNumber, trasactionNumber, userId, vipSubPackageId, paymentSlipUrl }: CreatePackagePurchaseRequestDto) => {
        const existingRequest = await PackagePurchaseRequestRepository.findOneByUserId(userId);
        if (existingRequest) {
            return await PackagePurchaseRequestRepository.updateRequest(existingRequest.id, {
                vipSubPackageId: vipSubPackageId,
                status: "pending",
                paymentType: paymentType,
                transactionNumber: trasactionNumber,
                sendingNumber: sendingNumber,
                paymentSlipUrl: paymentSlipUrl,
            });
        }
        return await PackagePurchaseRequestRepository.create({
            vipSubPackageId: vipSubPackageId,
            transactionNumber: trasactionNumber,
            sendingNumber: sendingNumber,
            paymentSlipUrl: paymentSlipUrl,
            paymentType: paymentType,
            userId
        });

    },

    // Update the status of a PackagePurchaseRequest
    updateRequestStatus: async (id: string, status: string) => {
        const request = await PackagePurchaseRequestRepository.findById(id);
        if (!request) {
            throw APIError.notFound("PackagePurchaseRequest not found");
        }

        // Update the status
        await PackagePurchaseRequestRepository.updateStatus(id, status);

        // If status is accepted, create or update the PackagePurchase
        if (status === "accepted") {
            const user = await prisma.user.findUnique({
                where: {
                    id: request.userId,
                },
                include: {
                    ActivePackage: true,
                }
            });
            if (!user) {
                throw APIError.notFound("User not found")
            }
            const packagePurchase = user.ActivePackage
            // Calculate expiry date
            const purchaseDate = new Date();
            const expiryDate = new Date(purchaseDate);
            expiryDate.setDate(purchaseDate.getDate() + request.vipSubPackage.validity);
            if (packagePurchase) {
                // Update the existing PackagePurchase
                await prisma.packagePurchase.update({
                    where: { id: packagePurchase.id },
                    data: {
                        validity: request.vipSubPackage.validity,
                        amount: request.vipSubPackage.amount,
                        entryAnimation: request.vipSubPackage.entryAnimation,
                        imageUrl: request.vipSubPackage.imageUrl,
                        profileFrame: request.vipSubPackage.profileFrame,
                        name: request.vipSubPackage.name,
                        type: request.vipSubPackage.VipPackage.type,
                        expiryDate
                    },
                });
            } else {
                // Create a new PackagePurchase
                const activePackage = await prisma.packagePurchase.create({
                    data: {
                        validity: request.vipSubPackage.validity,
                        amount: request.vipSubPackage.amount,
                        entryAnimation: request.vipSubPackage.entryAnimation,
                        imageUrl: request.vipSubPackage.imageUrl,
                        profileFrame: request.vipSubPackage.profileFrame,
                        name: request.vipSubPackage.name,
                        type: request.vipSubPackage.VipPackage.type,
                        expiryDate
                    }
                })
                await prisma.user.update({
                    where: { id: request.userId },
                    data: {
                        activePackageId: activePackage.id,
                    }
                })
            }
        }
    },

    fetchAllPackagePurchaseRequest: async () => {
        return await PackagePurchaseRequestRepository.fetchAllList()
    }
};

export default PackagePurchaseRequestService;