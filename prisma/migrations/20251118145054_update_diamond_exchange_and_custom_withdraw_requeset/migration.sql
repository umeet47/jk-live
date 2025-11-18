/*
  Warnings:

  - You are about to drop the column `userFullname` on the `CustomWithdrawRequest` table. All the data in the column will be lost.
  - You are about to drop the column `userNumber` on the `CustomWithdrawRequest` table. All the data in the column will be lost.
  - The primary key for the `_DeviceToUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_UserBlocks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_UserFollows` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[type]` on the table `DiamondExchange` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_DeviceToUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_UserBlocks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_UserFollows` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountNumber` to the `CustomWithdrawRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullname` to the `CustomWithdrawRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regNumber` to the `CustomWithdrawRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `DiamondExchange` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustomWithdrawRequest" DROP COLUMN "userFullname",
DROP COLUMN "userNumber",
ADD COLUMN     "accountNumber" TEXT NOT NULL,
ADD COLUMN     "fullname" TEXT NOT NULL,
ADD COLUMN     "profilePic" TEXT,
ADD COLUMN     "regNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "DiamondExchange" ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "_DeviceToUser" DROP CONSTRAINT "_DeviceToUser_AB_pkey";

-- AlterTable
ALTER TABLE "_UserBlocks" DROP CONSTRAINT "_UserBlocks_AB_pkey";

-- AlterTable
ALTER TABLE "_UserFollows" DROP CONSTRAINT "_UserFollows_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "DiamondExchange_type_key" ON "DiamondExchange"("type");

-- CreateIndex
CREATE UNIQUE INDEX "_DeviceToUser_AB_unique" ON "_DeviceToUser"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserBlocks_AB_unique" ON "_UserBlocks"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserFollows_AB_unique" ON "_UserFollows"("A", "B");
