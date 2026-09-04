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
