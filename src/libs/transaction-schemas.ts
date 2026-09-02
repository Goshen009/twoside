import { z } from "zod/v4";

export type WarningCode = 'INSUFFICIENT_BALANCE' | 'REPAYMENT_DATED_BEFORE';

class TransactionSchemas {
	static insufficientBalanceMessage(accountName: string, balanceInAccount: number, amountRequested: number): string {
    const format = (amount: number): string =>
      `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	
    return `${accountName} only has ${format(balanceInAccount)} but ${format(amountRequested)} was requested.`;
  }

  static repaymentDatedBeforeMessage(dateIssued: Date): string {
    const formatted = dateIssued.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  
    return `This repayment is dated before the loan was issued (${formatted}).`;
  }
	
  static commonFields() {
    return {
      description: z.string("description is required and must be a string").max(100, "description must not be more than 100 characters"),
      transaction_date: z.iso.datetime("transaction_date is required and must be in the format 2020-01-01T00:00:00Z"),
    };
  }

  static bypassWarnings<const T extends readonly WarningCode[]>(allowed: T) {
    return z.array(z.enum(allowed)).default([]);
  }

  static accountAllocations(field_label: string) {
    return z.array(
    	z.object({
        account_id: z.uuid(`${field_label}_id is required and must be a valid UUID`),
        amount: z.number("amount is required and must be a number").positive("amount must be greater than 0").multipleOf(0.01),
      })
    )
    .min(1, `at least one ${field_label} is required`)
    .refine((list) => new Set(list.map((item) => item.account_id)).size === list.length, { 
    	error: `the same account cannot appear more than once in this list` });
  }
}

export default TransactionSchemas;