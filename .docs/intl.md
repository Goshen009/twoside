## The three settings, explained

**Timezone (IANA), currency, and locale are three separate facts about a person.** They usually correlate but none of them can be reliably derived from another — so store all three, ask for all three.

- **Timezone** — "what time is it where you are." Needed for anything date-based: "what's my balance as of end of day," "what happened this week." A country can span multiple timezones (US, Australia both do), so timezone must be its own choice, not derived from country.
- **Currency** — "what unit is my money in." Needed for all the amount math and display.
- **Locale** — "how do I want numbers/dates formatted" (comma vs. period, symbol placement, language). This is the one that's genuinely NOT derivable from timezone — someone in Lagos might still want US-style formatting, and vice versa.

None of the three should be derived from each other in your data model — always store all three explicitly, even if your UI is smart about suggesting sensible defaults.

### Suggested onboarding flow

**Page 1 — Timezone**
"What timezone are you in?"
- Show a searchable list of IANA zones (e.g. `Africa/Lagos`, `Europe/London`, `America/New_York`, `Australia/Sydney`, `Africa/Accra`), not a list of countries — since a country can map to more than one zone (the US, Australia). For your five target places this is simple, one zone each, but building it as a timezone-picker rather than a country-picker means it won't break later if you support a multi-zone country.
- Nicety: pre-select a guess using the browser's `Intl.DateTimeFormat().resolvedOptions().timeZone` — but let them change it and confirm.

**Page 2 — Currency**
"What currency do you use?"
- A short list, since you only support five: NGN, GBP, USD, AUD, GHS.
- Cannot be derived from timezone — don't try. Someone on `Africa/Lagos` may still want USD if that's the currency they think in.

**Page 3 — Locale**
"How would you like numbers and dates formatted?"
- Since your five supported places are Nigeria, UK, US, Australia, Ghana, you could offer this as a simple named list rather than raw BCP-47 codes: "Nigerian English", "British English", "American English", "Australian English", "Ghanaian English" — mapping under the hood to `en-NG`, `en-GB`, `en-US`, `en-AU`, `en-GH`.
- Nicety: pre-select a guess from the browser's `navigator.language`, but let them override — this is genuinely a separate preference from both timezone and currency, so don't hide the question even though it feels repetitive.

---

## The `Intl` functions you've run into, explained

`Intl` is a built-in JavaScript namespace for locale-aware formatting — no library needed. Here's what each piece you've seen actually does:

**`Intl.NumberFormat(locale, options).format(number)`**
Formats a number according to a locale's conventions. With `style: 'currency', currency: 'NGN'`, it adds the correct currency symbol, decimal places, and grouping separators for that currency automatically:
```ts
new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(1234.5)
// → "₦1,234.50"
```
This is what you use anywhere you're displaying a monetary amount to a user.

**`Intl.DateTimeFormat(locale, options)`**
Same idea, but for dates/times — formats a `Date` according to locale conventions (date order, month names, etc.). You haven't used this yet, but you likely will once you build reporting ("March 5, 2026" vs "5 March 2026" vs "05/03/2026").
```ts
new Intl.DateTimeFormat('en-GB').format(new Date())
// → "6/9/2026" (day/month/year order, UK-style)
```

**`Intl.supportedValuesOf('timeZone')`**
Returns the full list of valid IANA timezone strings your current JS runtime knows about. Used purely for validation — "is this a real timezone the person typed/selected."
```ts
Intl.supportedValuesOf('timeZone').includes('Africa/Lagos') // → true
```

**`Intl.getCanonicalLocales(locale)`**
Validates and normalizes a BCP-47 locale tag. If you pass it garbage, it throws; if valid, it returns the canonical form. Used the same way — as a validation check, not for formatting.
```ts
Intl.getCanonicalLocales('en-NG') // → ["en-NG"]
Intl.getCanonicalLocales('not-a-real-locale') // → throws RangeError
```

**How they relate**: `supportedValuesOf` and `getCanonicalLocales` are validation helpers — you use them once, at the API boundary, to reject garbage input when a user sets their preferences. `NumberFormat` and `DateTimeFormat` are the actual formatting tools — you use them constantly, anywhere you're turning a raw number or `Date` into text for a specific user to read.

LOCALE MIGHT NEVER CHANGE