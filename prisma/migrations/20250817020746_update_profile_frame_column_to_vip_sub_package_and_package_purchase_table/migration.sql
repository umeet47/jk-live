-- AlterTable
ALTER TABLE "public"."PackagePurchase" ADD COLUMN     "profileFrame" TEXT;

-- AlterTable
ALTER TABLE "public"."VipSubPackage" ADD COLUMN     "profileFrame" TEXT;

-- AlterTable
ALTER TABLE "public"."_DeviceToUser" ADD CONSTRAINT "_DeviceToUser_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_DeviceToUser_AB_unique";

-- AlterTable
ALTER TABLE "public"."_UserBlocks" ADD CONSTRAINT "_UserBlocks_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_UserBlocks_AB_unique";

-- AlterTable
ALTER TABLE "public"."_UserFollows" ADD CONSTRAINT "_UserFollows_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_UserFollows_AB_unique";
