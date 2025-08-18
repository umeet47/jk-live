/*
  Warnings:

  - The primary key for the `Animation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `History` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ResellerHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `VipPackage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[regNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "History" DROP CONSTRAINT "History_userId_fkey";

-- DropForeignKey
ALTER TABLE "ResellerHistory" DROP CONSTRAINT "ResellerHistory_resellerId_fkey";

-- DropForeignKey
ALTER TABLE "ResellerHistory" DROP CONSTRAINT "ResellerHistory_senderId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_animationId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_vipPackageId_fkey";

-- DropForeignKey
ALTER TABLE "_UserBlocks" DROP CONSTRAINT "_UserBlocks_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserBlocks" DROP CONSTRAINT "_UserBlocks_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserFollows" DROP CONSTRAINT "_UserFollows_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserFollows" DROP CONSTRAINT "_UserFollows_B_fkey";

-- AlterTable
ALTER TABLE "Animation" DROP CONSTRAINT "Animation_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Animation_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Animation_id_seq";

-- AlterTable
ALTER TABLE "History" DROP CONSTRAINT "History_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "History_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "History_id_seq";

-- AlterTable
ALTER TABLE "ResellerHistory" DROP CONSTRAINT "ResellerHistory_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "resellerId" SET DATA TYPE TEXT,
ALTER COLUMN "senderId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ResellerHistory_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ResellerHistory_id_seq";

-- AlterTable
CREATE SEQUENCE user_regnumber_seq;
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "regNumber" SET DEFAULT nextval('user_regnumber_seq'),
ALTER COLUMN "vipPackageId" SET DATA TYPE TEXT,
ALTER COLUMN "animationId" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";
ALTER SEQUENCE user_regnumber_seq OWNED BY "User"."regNumber";

-- AlterTable
ALTER TABLE "VipPackage" DROP CONSTRAINT "VipPackage_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "VipPackage_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "VipPackage_id_seq";

-- AlterTable
ALTER TABLE "_UserBlocks" ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "_UserFollows" ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_regNumber_key" ON "User"("regNumber");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_vipPackageId_fkey" FOREIGN KEY ("vipPackageId") REFERENCES "VipPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_animationId_fkey" FOREIGN KEY ("animationId") REFERENCES "Animation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResellerHistory" ADD CONSTRAINT "ResellerHistory_resellerId_fkey" FOREIGN KEY ("resellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResellerHistory" ADD CONSTRAINT "ResellerHistory_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFollows" ADD CONSTRAINT "_UserFollows_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFollows" ADD CONSTRAINT "_UserFollows_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserBlocks" ADD CONSTRAINT "_UserBlocks_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserBlocks" ADD CONSTRAINT "_UserBlocks_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
