/*
  Warnings:

  - You are about to drop the column `amount` on the `ResellerHistory` table. All the data in the column will be lost.
  - You are about to drop the column `resellerId` on the `ResellerHistory` table. All the data in the column will be lost.
  - Added the required column `diamond` to the `ResellerHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverId` to the `ResellerHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ResellerHistory" DROP CONSTRAINT "ResellerHistory_resellerId_fkey";

-- AlterTable
ALTER TABLE "ResellerHistory" DROP COLUMN "amount",
DROP COLUMN "resellerId",
ADD COLUMN     "diamond" INTEGER NOT NULL,
ADD COLUMN     "receiverId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ResellerHistory" ADD CONSTRAINT "ResellerHistory_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
