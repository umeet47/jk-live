import { UserDto } from "../users/user.interface";
import { VipSubPackageDto } from "../vip-package/vip-package.interface";

export type PaymentType = "bikash" | "nagad"
export interface CreatePackagePurchaseRequestDto {
    userId: string;
    vipSubPackageId: string;
    paymentType: PaymentType;
    trasactionNumber: string;
    sendingNumber: string;
    paymentSlipUrl?: string | null;
}

export interface PackagePurchaseRequestResponse {
    success: boolean;
    result?: {
        id: string;
        status: string;
        paymentType: string;
        sendingNumber: string;
        userId: string;
        vipSubPackageId: string;
        paymentSlipUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        transactionNumber: string;
    };
}

export interface AllPackagePurchaseRequestListResponse {
    success: boolean;
    data: {
        id: string;
        status: string;
        paymentType: string;
        sendingNumber: string;
        userId: string;
        vipSubPackageId: string;
        paymentSlipUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        transactionNumber: string;
        user: UserDto;
        vipSubPackage: VipSubPackageDto
    }[]

}