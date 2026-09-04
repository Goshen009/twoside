import { z } from "zod";

export const loginSchema = z.object({
	username: z.string("username must be a string").min(5, "username must be at least 5 characters").max(100, "username must not be more than 100 characters"),
	pin: z.string("pin is required").regex(/^\d{6}$/, "pin must be 6 digits"),
});

export const registerSchema = z.object({
	username: z.string("username must be a string").min(5, "username must be at least 5 characters").max(100, "username must not be more than 100 characters"),
	pin: z.string("pin is required").regex(/^\d{6}$/, "pin must be 6 digits"),
	confirm_pin: z.string("confirm pin is required").regex(/^\d{6}$/, "confirm pin must be 6 digits"),
}).refine(data => data.pin === data.confirm_pin, {
	error: "Pins do not match",
	path: ['confirm_pin']
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;