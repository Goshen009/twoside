/*
  Warnings:

  - You are about to drop the column `type` on the `journal_entries` table. All the data in the column will be lost.
  - Made the column `log_type` on table `journal_entries` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "journal_entries" DROP COLUMN "type",
ALTER COLUMN "log_type" SET NOT NULL;
