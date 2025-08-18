-- DropForeignKey
ALTER TABLE "DiamondHistory" DROP CONSTRAINT "DiamondHistory_handlerId_fkey";

-- DropForeignKey
ALTER TABLE "DiamondHistory" DROP CONSTRAINT "DiamondHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "GiftHistory" DROP CONSTRAINT "GiftHistory_senderId_fkey";

-- AddForeignKey
ALTER TABLE "DiamondHistory" ADD CONSTRAINT "DiamondHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiamondHistory" ADD CONSTRAINT "DiamondHistory_handlerId_fkey" FOREIGN KEY ("handlerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftHistory" ADD CONSTRAINT "GiftHistory_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
