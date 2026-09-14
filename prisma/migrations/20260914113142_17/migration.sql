-- AlterTable
ALTER TABLE "users" ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "iana_timezone" DROP NOT NULL,
ALTER COLUMN "currency_symbol" DROP NOT NULL;
