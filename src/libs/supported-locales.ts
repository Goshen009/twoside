const SUPPORTED_TIMEZONES = [
  'Africa/Lagos',
  'Africa/Accra',
  'Europe/London',
  'Australia/Sydney',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
] as const;

const SUPPORTED_CURRENCIES = [
  'NGN',
  'GHS',
  'GBP',
  'AUD',
  'USD',
] as const;

const SUPPORTED_LOCALES = [
  'en-NG',
  'en-GH',
  'en-GB',
  'en-AU',
  'en-US',
] as const;

export type SupportedTimezone = typeof SUPPORTED_TIMEZONES[number];
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

// validate as
// import { z } from "zod/v4";
// import { SUPPORTED_TIMEZONES, SUPPORTED_CURRENCIES, SUPPORTED_LOCALES } from "#/libs/supported-locales.js";

// const timezone = z.enum(SUPPORTED_TIMEZONES);
// const currency = z.enum(SUPPORTED_CURRENCIES);
// const locale = z.enum(SUPPORTED_LOCALES);