-- CreateEnum
CREATE TYPE "Device" AS ENUM ('IOS', 'ANDROID', 'DESKTOP');

-- CreateTable
CREATE TABLE "AppOpen" (
    "id" TEXT NOT NULL,
    "device" "Device" NOT NULL,
    "is_pwa" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "AppOpen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppOpen_user_id_created_at_idx" ON "AppOpen"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "AppOpen" ADD CONSTRAINT "AppOpen_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
