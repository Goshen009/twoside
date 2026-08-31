-- DropIndex
DROP INDEX "journal_entries_trx_date_id_idx";

-- CreateIndex
CREATE INDEX "journal_entries_trx_date_created_at_id_idx" ON "journal_entries"("trx_date" DESC, "created_at" DESC, "id" DESC);
