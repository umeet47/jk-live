/*
  Warnings:

  - A unique constraint covering the columns `[activeProfileFrameId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activeProfileFrameId" TEXT;

-- CreateTable
CREATE TABLE "ProfileFramePurchase" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "validity" INTEGER NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileFramePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileFrame" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "validity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileFrame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_activeProfileFrameId_key" ON "User"("activeProfileFrameId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_activeProfileFrameId_fkey" FOREIGN KEY ("activeProfileFrameId") REFERENCES "ProfileFramePurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
