import { DateTime } from "luxon";

class Format {
	static money(amount: number, currency_symbol: string) {
		const [whole, decimal] = amount.toFixed(2).split(".");
		const with_separators = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return { 
			whole: `${currency_symbol}${with_separators}`,
			decimal,
			full: `${currency_symbol}${with_separators}.${decimal}`
		};
	}

	static time(iso: string, timezone: string) {
		const datetime_in_timezone = DateTime.fromISO(iso, { zone: 'utc' }).setZone(timezone);
		return {
	    time: datetime_in_timezone.toFormat("h:mm a"),           // "3:45 PM"
	    full: datetime_in_timezone.toFormat("MMMM d, yyyy 'at' h:mm a"), // "September 25, 2026 at 3:45 PM"
	  };
	}
}

export default Format;