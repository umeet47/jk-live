/*
  Warnings:

  - You are about to drop the column `date` on the `VipPackage` table. All the data in the column will be lost.
  - Changed the type of `validity` on the `Animation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `validity` on the `VipPackage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Animation" DROP COLUMN "validity",
ADD COLUMN     "validity" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleLogin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "VipPackage" DROP COLUMN "date",
DROP COLUMN "validity",
ADD COLUMN     "validity" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "DiamondPackage" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "bdt" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiamondPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiamondHistory" (
    "id" TEXT NOT NULL,
    "diamond" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "handlerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiamondHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DiamondHistory" ADD CONSTRAINT "DiamondHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiamondHistory" ADD CONSTRAINT "DiamondHistory_handlerId_fkey" FOREIGN KEY ("handlerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
