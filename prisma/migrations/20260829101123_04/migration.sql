-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER', 'GIVE_LOAN', 'BORROW', 'RECEIVE_REPAYMENT', 'REPAY_LOAN');

-- AlterTable
ALTER TABLE "journal_entries" ADD COLUMN     "type" "LogType";
