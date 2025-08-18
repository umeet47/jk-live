import { UserDto } from "../users/user.interface";

type vipPackageType = "vip" | "vvip";

export interface CreateVipPackageDto {
  name: string;
  type: vipPackageType;
  imageUrl: string;
}
export interface UpdateVipPackageDto {
  name?: string;
  type?: vipPackageType;
  imageUrl?: string;
}

export interface CreateVipSubPackageDto {
  vipPackageId: string;
  name: string;
  amount: number;
  validity: number;
  imageUrl: string;
  entryAnimation?: string | null;
  profileFrame?: string | null;
}
export interface UpdateVipSubPackageDto {
  name?: string;
  amount?: number;
  validity?: number;
  imageUrl?: string;
  entryAnimation?: string | null;
  profileFrame?: string | null;
}

export interface UpdateVipSubPackageDto {
  name?: string;
  amount?: number;
  validity?: number;
  imageUrl?: string;
  entryAnimation?: string | null;
  profileFrame?: string | null;
}

export interface VipPacakgeQueryDto {
  type: vipPackageType;
}

export interface VipPackageDto {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  type: string;
  imageUrl: string;
}

export interface VipPackageResponse {
  success: boolean;
  result?: VipPackageDto | VipPackageDto[];
}
export interface VipPackageResponseWithSubPackage {
  success: boolean;
  result: VipPackageDto & {
    VipSubPackages: {
      id: string;
      name: string;
      amount: number;
      validity: number;
      imageUrl: string;
      entryAnimation?: string | null;
      profileFrame?: string | null;
    }[];
  }
}
export interface VipSubPackageDto {
  id: string;
  name: string;
  amount: number;
  validity: number;
  imageUrl: string;
  entryAnimation?: string | null;
  profileFrame?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VipSubPackageResponse {
  success: boolean;
  result?: VipSubPackageDto | VipSubPackageDto[];
}

export interface BuyVipSubPackageResponse {
  success: boolean;
  data: UserDto
}