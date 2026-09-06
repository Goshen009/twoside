-- This is an empty migration.

ALTER TABLE "users" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'NGN';
ALTER TABLE "users" ADD COLUMN "iana_timezone" TEXT NOT NULL DEFAULT 'Africa/Lagos';

ALTER TABLE "users" ALTER COLUMN "currency" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "iana_timezone" DROP DEFAULT;