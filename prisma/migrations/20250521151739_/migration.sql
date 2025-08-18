/*
  Warnings:

  - You are about to drop the column `audio` on the `Animation` table. All the data in the column will be lost.
  - You are about to drop the column `gif` on the `Animation` table. All the data in the column will be lost.
  - You are about to drop the column `animationId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `animationPurchaseDate` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[activeAnimationId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Animation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `videoUrl` to the `Animation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_animationId_fkey";

-- AlterTable
ALTER TABLE "Animation" DROP COLUMN "audio",
DROP COLUMN "gif",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "videoUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "animationId",
DROP COLUMN "animationPurchaseDate",
ADD COLUMN     "activeAnimationId" TEXT;

-- CreateTable
CREATE TABLE "AnimationPurchase" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "validity" INTEGER NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnimationPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_activeAnimationId_key" ON "User"("activeAnimationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_activeAnimationId_fkey" FOREIGN KEY ("activeAnimationId") REFERENCES "AnimationPurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
