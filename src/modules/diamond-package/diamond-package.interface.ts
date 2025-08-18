export interface CreateDiamondPackageDto {
  amount: number;
  bdt: number;
}
export interface DiamondPackage {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  amount: number;
  bdt: number;
}

export interface CreateDiamondPackageResponse {
  success: boolean;
  data: DiamondPackage
}

export interface RemoveDiamondPackageResponse {
  success: boolean;
}

export interface FetchDiamondPackageListResponse {
  success: boolean;
  data: DiamondPackage[]
}