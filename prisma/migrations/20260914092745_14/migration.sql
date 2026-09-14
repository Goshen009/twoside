-- CreateTable
CREATE TABLE "credentials" (
    "email" TEXT NOT NULL,

    CONSTRAINT "credentials_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "otp_attempts" (
    "email" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL,
    "hashed_otp" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "cooldown_expires_at" TIMESTAMPTZ(6) NOT NULL,
    "limit_send_count" INTEGER NOT NULL DEFAULT 0,
    "limit_reset_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "otp_attempts_pkey" PRIMARY KEY ("email")
);
