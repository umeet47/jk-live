-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "withdrawFlag" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);
