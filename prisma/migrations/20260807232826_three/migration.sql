/*
  Warnings:

  - You are about to drop the column `period_label` on the `budget_allocations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "budget_allocations" DROP COLUMN "period_label";

-- CreateTable
CREATE TABLE "account_balance_snapshots" (
    "id" TEXT NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL,
    "as_of_date" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "account_id" TEXT NOT NULL,

    CONSTRAINT "account_balance_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_snapshots" (
    "id" TEXT NOT NULL,
    "total_allocated" DECIMAL(12,2) NOT NULL,
    "total_spent" DECIMAL(12,2) NOT NULL,
    "as_of_date" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "budget_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_balance_snapshots_account_id_as_of_date_key" ON "account_balance_snapshots"("account_id", "as_of_date");

-- CreateIndex
CREATE UNIQUE INDEX "budget_snapshots_category_id_as_of_date_key" ON "budget_snapshots"("category_id", "as_of_date");

-- AddForeignKey
ALTER TABLE "account_balance_snapshots" ADD CONSTRAINT "account_balance_snapshots_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_snapshots" ADD CONSTRAINT "budget_snapshots_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
