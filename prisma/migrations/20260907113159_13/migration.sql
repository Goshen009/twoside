/*
  Warnings:

  - You are about to drop the column `is_system` on the `categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "is_system",
ADD COLUMN     "is_charge" BOOLEAN NOT NULL DEFAULT false;
