/*
  Warnings:

  - Added the required column `diamond` to the `CustomWithdrawRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustomWithdrawRequest" ADD COLUMN     "diamond" DOUBLE PRECISION NOT NULL;
