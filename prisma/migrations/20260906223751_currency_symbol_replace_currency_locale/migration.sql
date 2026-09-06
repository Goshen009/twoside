-- This is an empty migration.

-- add the new column with a temp default so the existing row(s) can backfill
ALTER TABLE "users" ADD COLUMN "currency_symbol" TEXT NOT NULL DEFAULT '₦';

-- remove the default so nothing can silently rely on it going forward
ALTER TABLE "users" ALTER COLUMN "currency_symbol" DROP DEFAULT;

-- drop the two columns this replaces
ALTER TABLE "users" DROP COLUMN "currency";
ALTER TABLE "users" DROP COLUMN "locale";