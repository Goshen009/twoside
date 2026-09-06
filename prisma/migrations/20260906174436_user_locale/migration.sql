-- This is an empty migration.
ALTER TABLE "users" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en-NG';
ALTER TABLE "users" ALTER COLUMN "locale" DROP DEFAULT;