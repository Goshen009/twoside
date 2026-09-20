/*
  Warnings:

  - You are about to drop the column `currency_symbol` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `iana_timezone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "currency_symbol",
DROP COLUMN "iana_timezone",
DROP COLUMN "password",
DROP COLUMN "username";
