/*
  Warnings:

  - Made the column `type` on table `journal_entries` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "journal_entries" ALTER COLUMN "type" SET NOT NULL;
