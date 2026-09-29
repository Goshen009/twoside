import { z } from "zod/v4";

export type WarningCode = 'INSUFFICIENT_BALANCE' | 'REPAYMENT_DATED_BEFORE';

class TransactionSchemas {
	static readonly MAX_AMOUNT = 9_999_999_999.99;
  static readonly TOO_LARGE = "Do you really have almost 10 billion in your account right now? Even if you do, that's too large for my app to handle.";

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
        amount: z.number("Amount must be a number").positive("Amount must be greater than 0").multipleOf(0.01, "Amount must be in 2dp").max(TransactionSchemas.MAX_AMOUNT, TransactionSchemas.TOO_LARGE),
        charge: z.number("Charge must be a number").nonnegative("Charge cannot be negative").multipleOf(0.01, "Charge must be in 2dp").max(TransactionSchemas.MAX_AMOUNT, TransactionSchemas.TOO_LARGE).default(0),
      })
    )
    .min(1, `At least one ${field_label} account is required`)
    .refine((list) => new Set(list.map((item) => item.account_id)).size === list.length, { 
    	error: `The same account cannot appear more than once for a transaction.` })
    .refine((list) => {
      const total_cents = list.reduce((acc, item) => acc + Math.round(item.amount * 100) + Math.round(item.charge * 100), 0);
      return total_cents <= Math.round(TransactionSchemas.MAX_AMOUNT * 100);
    }, { error: TransactionSchemas.TOO_LARGE });
  }
}

export default TransactionSchemas;