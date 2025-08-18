-- CreateTable
CREATE TABLE "DiamondExchange" (
    "id" TEXT NOT NULL,
    "diamond" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiamondExchange_pkey" PRIMARY KEY ("id")
);
