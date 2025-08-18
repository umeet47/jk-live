/*
  Warnings:

  - You are about to drop the column `packagePurchaseDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `vipPackageId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `VipPackage` table. All the data in the column will be lost.
  - You are about to drop the column `validity` on the `VipPackage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[activePackageId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_vipPackageId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "packagePurchaseDate",
DROP COLUMN "vipPackageId",
ADD COLUMN     "activePackageId" TEXT;

-- AlterTable
ALTER TABLE "VipPackage" DROP COLUMN "amount",
DROP COLUMN "validity",
ALTER COLUMN "type" SET DEFAULT 'VIP';

-- CreateTable
CREATE TABLE "PackagePurchase" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "validity" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "entryAnimation" TEXT,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackagePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VipSubPackage" (
    "id" TEXT NOT NULL,
    "vipPackageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "validity" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "entryAnimation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VipSubPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackagePurchaseRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vipSubPackageId" TEXT NOT NULL,
    "paymentType" TEXT NOT NULL,
    "sendingNumber" TEXT NOT NULL,
    "transactionNumber" TEXT NOT NULL,
    "paymentSlipUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackagePurchaseRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_activePackageId_key" ON "User"("activePackageId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_activePackageId_fkey" FOREIGN KEY ("activePackageId") REFERENCES "PackagePurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VipSubPackage" ADD CONSTRAINT "VipSubPackage_vipPackageId_fkey" FOREIGN KEY ("vipPackageId") REFERENCES "VipPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagePurchaseRequest" ADD CONSTRAINT "PackagePurchaseRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagePurchaseRequest" ADD CONSTRAINT "PackagePurchaseRequest_vipSubPackageId_fkey" FOREIGN KEY ("vipSubPackageId") REFERENCES "VipSubPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
