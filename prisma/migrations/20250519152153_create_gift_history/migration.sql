-- CreateTable
CREATE TABLE "GiftHistory" (
    "id" TEXT NOT NULL,
    "diamondBonus" INTEGER NOT NULL,
    "diamond" INTEGER NOT NULL,
    "senderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GiftHistory" ADD CONSTRAINT "GiftHistory_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
