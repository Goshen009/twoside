export class FormatUtils {
  /** en-NG grouping, always 2dp, NO currency prefix (prefix rendered separately). */
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

  /**
   * Parse for display. Full ISO timestamps are parsed as-is and rendered in the
   * account timezone when one is supplied; bare "YYYY-MM-DD" values (filter
   * dates) are parsed at local noon so the calendar day never shifts.
   */
  private static parseForDisplay(iso: string, time_zone?: string): {
    date: Date;
    tz_options: { timeZone?: string };
  } {
    const is_date_only = /^\d{4}-\d{2}-\d{2}$/.test(iso);
    const date = is_date_only
      ? new Date(`${iso}T12:00:00`)
      : new Date(iso);
    const tz_options = !is_date_only && time_zone ? { timeZone: time_zone } : {};
    return { date, tz_options };
  }

  /** ISO timestamp → "Sep 5, 2026". */
  static formatDate(iso: string, time_zone?: string): string {
    const { date, tz_options } = this.parseForDisplay(iso, time_zone);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      ...tz_options,
    });
  }

  /** ISO timestamp → "September 5, 2026". */
  static formatDateLong(iso: string, time_zone?: string): string {
    const { date, tz_options } = this.parseForDisplay(iso, time_zone);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      ...tz_options,
    });
  }

  /** ISO timestamp → "Sep 5, 2026, 10:49 AM". */
  static formatDateTime(iso: string, time_zone?: string): string {
    const { date, tz_options } = this.parseForDisplay(iso, time_zone);
    if (Number.isNaN(date.getTime())) return iso;
    const date_part = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      ...tz_options,
    });
    const time_part = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      ...tz_options,
    });
    return `${date_part}, ${time_part}`;
  }
}
