-- CreateTable
CREATE TABLE "test_chat_messages" (
    "id" TEXT NOT NULL,
    "chat_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "test_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "test_chat_messages_chat_id_idx" ON "test_chat_messages"("chat_id");

-- AddForeignKey
ALTER TABLE "test_chat_messages" ADD CONSTRAINT "test_chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
