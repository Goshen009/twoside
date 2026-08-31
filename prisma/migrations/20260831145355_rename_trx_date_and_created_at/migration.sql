-- This is an empty migration.

-- JournalEntry
ALTER TABLE "journal_entries" RENAME COLUMN "trx_date" TO "transaction_date";
ALTER TABLE "journal_entries" RENAME COLUMN "created_at" TO "posted_at";

-- Loan
ALTER TABLE "loans" RENAME COLUMN "created_at" TO "posted_at";

-- LoanRepayment
ALTER TABLE "loan_repayments" RENAME COLUMN "created_at" TO "posted_at";