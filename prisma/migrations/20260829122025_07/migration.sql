-- CreateIndex
CREATE INDEX "journal_entries_trx_date_id_idx" ON "journal_entries"("trx_date" DESC, "id" DESC);
