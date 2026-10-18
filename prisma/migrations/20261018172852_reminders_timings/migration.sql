-- AlterTable
ALTER TABLE "User" ADD COLUMN     "last_reminded_on" TEXT,
ADD COLUMN     "reminder_minutes" INTEGER NOT NULL DEFAULT 1200;
