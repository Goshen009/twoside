import { DateTime } from "luxon";

export class Dates {
	/** Today's date (YYYY-MM-DD) in the user's timezone. */
	static todayKey(timezone: string): string {
	  return DateTime.now().setZone(timezone).toISODate() ?? "";
		}
		
	/** "Today", "Yesterday", "Sat, 3 Oct" (year added when it isn't this year). */
	static dayLabel(date: string, timezone: string): string {
	  const now = DateTime.now().setZone(timezone).startOf("day");
	  const day = DateTime.fromISO(date, { zone: timezone, locale: "en" }).startOf("day");
	  const diff = Math.round(now.diff(day, "days").days);
		
	  if (diff === 0) return "Today";
	  if (diff === 1) return "Yesterday";
	  return day.toFormat(day.year === now.year ? "ccc, d LLL" : "ccc, d LLL yyyy");
	}
		
	/** "12:30 AM" in the user's timezone, from a UTC ISO string. */
	static formatTime(iso: string, timezone: string): string {
	  return DateTime.fromISO(iso, { zone: timezone, locale: "en" }).toFormat("h:mm a");
	}

	static nowIso(): string {
  	return DateTime.now().toUTC().toISO() ?? new Date().toISOString();
	}
	
	/** "Tue, 6 Oct 2026 · 7:30 AM" in the user's timezone. */
	static formatDateTime(iso: string, timezone: string): string {
  	return DateTime.fromISO(iso, { zone: timezone, locale: "en" }).toFormat("ccc, d LLL yyyy · h:mm a");
	}
	
	/** Value for <input type="datetime-local">. */
	static toInputValue(iso: string, timezone: string): string {
  	return DateTime.fromISO(iso, { zone: timezone }).toFormat("yyyy-MM-dd'T'HH:mm");
	}
	
	/** datetime-local value (in the user's timezone) back to UTC ISO. */
	static fromInputValue(value: string, timezone: string): string | null {
  	return DateTime.fromISO(value, { zone: timezone }).toUTC().toISO();
	}

	/** True when two ISO strings are the same instant (Luxon, so formatting differences don't matter). */
	static sameInstant(a: string, b: string): boolean {
  	return DateTime.fromISO(a).toMillis() === DateTime.fromISO(b).toMillis();
	}
}