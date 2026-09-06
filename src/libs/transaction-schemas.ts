import { z } from "zod/v4";

export type WarningCode = 'INSUFFICIENT_BALANCE' | 'REPAYMENT_DATED_BEFORE';

class TransactionSchemas {	
  static commonFields() {
    return {
      description: z.string("Description must be a string").min(1, "Description must not be empty").max(100, "Description must not be more than 100 letters"),
      transaction_date: z.iso.datetime("Transaction date must be in the format 2020-01-01T00:00:00Z"),
    };
  }

  static bypassWarnings<const T extends readonly WarningCode[]>(allowed: T) {
    return z.array(z.enum(allowed)).default([]);
  }

  static accountAllocations(field_label: string) {
    return z.array(
    	z.object({
        account_id: z.uuid(`${field_label}_id is required and must be a valid UUID`),
        amount: z.number("Amount must be a number").positive("Amount must be greater than 0").multipleOf(0.01, "Amount must be in 2dp"),
      })
    )
    .min(1, `At least one ${field_label} account is required`)
    .refine((list) => new Set(list.map((item) => item.account_id)).size === list.length, { 
    	error: `The same account cannot appear more than once for a transaction.` });
  }
}

export default TransactionSchemas;