export class FormatUtils {
  /** en-NG grouping, always 2dp, NO currency prefix (prefix rendered separately). */
  static formatMoney(amount: number): string {
    return amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
}
