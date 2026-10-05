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
}