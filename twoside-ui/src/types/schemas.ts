import { z } from "zod";

const registerSchema = z.object({
  username: z
    .string("Username must be a string")
    .trim()
    .min(5, "Username must be at least 5 letters")
    .max(100, "Username must not be more than 100 letters"),
  password: z
    .string("Password is required")
    .trim()
    .min(6, "Password must be at least 6 letters")
    .max(100, "Password must not be more than 100 letters"),
});

const loginSchema = z.object({
  username: z
    .string("Username must be a string")
    .min(5, "Username must be at least 5 characters")
    .max(100, "Username must not be more than 100 characters"),
  password: z
    .string("Password is required")
    .trim()
    .min(6, "Password must be at least 6 letters")
    .max(100, "Password must not be more than 100 letters"),
});

export { registerSchema, loginSchema };
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;

// --- Transaction forms (amounts edited as strings, converted on submit) ---

const amount_string_schema = z
  .string()
  .trim()
  .min(1, "Amount is required")
  .refine(
    (value) => /^(0|[1-9]\d*)(\.\d{1,2})?$/.test(value),
    "Enter a valid amount (max 2 decimal places)",
  )
  .refine((value) => Number(value) > 0, "Amount must be greater than 0");

const expense_source_row_schema = z.object({
  account_id: z.string().trim().min(1, "Select an account"),
  amount: amount_string_schema,
});

export const expenseFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description must not be empty")
    .max(100, "Description must not be more than 100 letters"),
  transaction_date: z
    .string()
    .trim()
    .min(1, "Date and time are required")
    .refine((value) => {
      const normalized = value.length === 16 ? `${value}:00` : value;
      return !Number.isNaN(new Date(normalized).getTime());
    }, "Enter a valid date and time"),
  category_name: z
    .string()
    .trim()
    .max(100, "Category name must not be more than 100 letters")
    .nullable(),
  sources: z
    .array(expense_source_row_schema)
    .min(1, "At least one source account is required")
    .refine(
      (rows) => {
        const seen = new Set<string>();
        for (const row of rows) {
          if (!row.account_id) continue; // empty rows surface "Select an account", not this
          if (seen.has(row.account_id)) return false;
          seen.add(row.account_id);
        }
        return true;
      },
      "The same account cannot appear more than once",
    ),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

const income_destination_row_schema = z.object({
  account_id: z.string().trim().min(1, "Select an account"),
  amount: amount_string_schema,
});

export const incomeFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description must not be empty")
    .max(100, "Description must not be more than 100 letters"),
  transaction_date: z
    .string()
    .trim()
    .min(1, "Date and time are required")
    .refine((value) => {
      const normalized = value.length === 16 ? `${value}:00` : value;
      return !Number.isNaN(new Date(normalized).getTime());
    }, "Enter a valid date and time"),
  destinations: z
    .array(income_destination_row_schema)
    .min(1, "At least one destination account is required")
    .refine(
      (rows) => {
        const seen = new Set<string>();
        for (const row of rows) {
          if (!row.account_id) continue; // empty rows surface "Select an account", not this
          if (seen.has(row.account_id)) return false;
          seen.add(row.account_id);
        }
        return true;
      },
      "The same account cannot appear more than once",
    ),
});

export type IncomeFormValues = z.infer<typeof incomeFormSchema>;

export const transferFormSchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(1, "Description must not be empty")
      .max(100, "Description must not be more than 100 letters"),
    transaction_date: z
      .string()
      .trim()
      .min(1, "Date and time are required")
      .refine((value) => {
        const normalized = value.length === 16 ? `${value}:00` : value;
        return !Number.isNaN(new Date(normalized).getTime());
      }, "Enter a valid date and time"),
    amount: amount_string_schema,
    from_account_id: z
      .string()
      .trim()
      .min(1, "Select the account to transfer from"),
    to_account_id: z.string().trim().min(1, "Select the account to transfer to"),
  })
  // The picker already clears the other side when its account is re-tapped, so
  // equal accounts are unreachable through the UI — this mirrors the backend
  // refine as a last-resort guard for any other path.
  .refine(
    (data) =>
      !(
        data.from_account_id &&
        data.to_account_id &&
        data.from_account_id === data.to_account_id
      ),
    {
      message: "You cannot transfer money into the same account",
      path: ["to_account_id"],
    },
  );

export type TransferFormValues = z.infer<typeof transferFormSchema>;
