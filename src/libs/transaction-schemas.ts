import { z } from "zod/v4";

class TransactionSchemas {
  static commonFields() {
    return {
      description: z.string("description is required and must be a string").max(100, "description must not be more than 100 characters"),
      transaction_date: z.iso.datetime("transaction_date is required and must be in the format 2020-01-01T00:00:00Z"),
    };
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