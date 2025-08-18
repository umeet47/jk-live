-- CreateTable
CREATE TABLE "DiamondSendPercentage" (
    "id" TEXT NOT NULL,
    "percentage" DECIMAL(65,30) NOT NULL DEFAULT 0.02,
    "subtractFrom" TEXT NOT NULL DEFAULT 'sender',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiamondSendPercentage_pkey" PRIMARY KEY ("id")
);
