/*
  Warnings:

  - A unique constraint covering the columns `[user_id,lowercase_name]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,lowercase_name]` on the table `counterparties` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lowercase_name` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lowercase_name` to the `counterparties` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "categories_user_id_name_key";

-- DropIndex
DROP INDEX "counterparties_user_id_name_key";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "lowercase_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "counterparties" ADD COLUMN     "lowercase_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "categories_user_id_lowercase_name_key" ON "categories"("user_id", "lowercase_name");

-- CreateIndex
CREATE UNIQUE INDEX "counterparties_user_id_lowercase_name_key" ON "counterparties"("user_id", "lowercase_name");
