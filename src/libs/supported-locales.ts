const SUPPORTED_TIMEZONES = [
  'Africa/Lagos',
  'Africa/Accra',
  'Europe/London',
  'Australia/Sydney',
  'America/New_York',
] as const;

export const SUPPORTED_CURRENCY_SYMBOLS = ['₦', '₵', '£', '$'] as const;

export type SupportedTimezone = typeof SUPPORTED_TIMEZONES[number];
export type SupportedCurrencySymbol = typeof SUPPORTED_CURRENCY_SYMBOLS[number];

// validate as
// import { z } from "zod/v4";
// import { SUPPORTED_TIMEZONES, SUPPORTED_CURRENCIES, SUPPORTED_LOCALES } from "#/libs/supported-locales.js";

// const timezone = z.enum(SUPPORTED_TIMEZONES);
// const currency = z.enum(SUPPORTED_CURRENCIES);
// const locale = z.enum(SUPPORTED_LOCALES);