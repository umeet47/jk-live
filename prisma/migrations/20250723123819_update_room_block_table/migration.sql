/*
  Warnings:

  - You are about to drop the column `roomId` on the `RoomBlock` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[blockerId,blockedId]` on the table `RoomBlock` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "RoomBlock_roomId_blockerId_blockedId_key";

-- AlterTable
ALTER TABLE "RoomBlock" DROP COLUMN "roomId";

-- CreateIndex
CREATE UNIQUE INDEX "RoomBlock_blockerId_blockedId_key" ON "RoomBlock"("blockerId", "blockedId");
