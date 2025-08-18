/*
  Warnings:

  - A unique constraint covering the columns `[deviceId]` on the table `Device` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deviceId" TEXT;

-- CreateTable
CREATE TABLE "_DeviceToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DeviceToUser_AB_unique" ON "_DeviceToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_DeviceToUser_B_index" ON "_DeviceToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Device_deviceId_key" ON "Device"("deviceId");

-- AddForeignKey
ALTER TABLE "_DeviceToUser" ADD CONSTRAINT "_DeviceToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeviceToUser" ADD CONSTRAINT "_DeviceToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
