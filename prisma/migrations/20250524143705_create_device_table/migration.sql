/*
  Warnings:

  - You are about to drop the column `deviceBlocked` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isBlockedByAdmin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isLocked` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "deviceBlocked",
DROP COLUMN "isBlockedByAdmin",
DROP COLUMN "isLocked";

-- CreateTable
CREATE TABLE "Device" (
    "id" SERIAL NOT NULL,
    "deviceId" TEXT NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);
