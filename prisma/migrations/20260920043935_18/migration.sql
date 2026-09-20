-- CreateEnum
CREATE TYPE "PendingTokenAction" AS ENUM ('LOGIN', 'REGISTER');

-- DropIndex
DROP INDEX "user_profile_username_key";

-- CreateTable
CREATE TABLE "pending_tokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "action" "PendingTokenAction" NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_tokens_email_key" ON "pending_tokens"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pending_tokens_token_hash_key" ON "pending_tokens"("token_hash");
