export class FormatUtils {
  /** ISO 4217 code → currency symbol for the locale (e.g. "NGN"+en-NG → "₦").
   *  Falls back to the raw code if Intl has no symbol for the pair. */
  static currencySymbol(locale: string, currency: string): string {
    const parts = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).formatToParts(0);
    return parts.find((part) => part.type === "currency")?.value ?? currency;
  }

  /** Grouped number, always 2dp, NO currency prefix (symbol rendered separately
   *  via `currencySymbol`). All supported locales (en-NG/GH/GB/AU/US) group as
   *  en-NG does (comma thousands, dot fraction), so this holds for the set. */
  static formatMoney(amount: number): string {
    return amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /** Keeps only digits + a single dot, truncates the fraction to 2 (amount/charge inputs). */
  static sanitizeAmountInput(raw: string): string {
    const cleaned = raw.replace(/[^\d.]/g, "");
    const [integer, ...rest] = cleaned.split(".");
    if (rest.length === 0) return cleaned;
    const fraction = rest.join("").slice(0, 2);
    return `${integer}.${fraction}`;
  }

  /** Value for an <input type="datetime-local"> showing "now" in the device-local clock. */
  static nowLocalValue(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}T${hours}:${minutes}`;
  }

  /**
   * Convert a datetime-local value ("YYYY-MM-DDTHH:mm", device-local wall time) to a
   * UTC ISO string ending in "Z". Appending ":00" makes every engine parse it as local
   * time (ES date-time forms without an offset are local). Schema pre-validates.
   */
  static toUtcIso(local_value: string): string {
    const normalized =
      local_value.length === 16 ? `${local_value}:00` : local_value;
    return new Date(normalized).toISOString();
  }

  /** "YYYY-MM-DDTHH:mm" (device-local) → "September 5, 2026 10:49 AM". */
  static formatDateTimeLabel(local_value: string): string {
    const normalized =
      local_value.length === 16 ? `${local_value}:00` : local_value;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return "";
    const date_part = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const time_part = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${date_part} ${time_part}`;
  }
}
