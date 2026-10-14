import { DateTime } from "luxon";
import { PrismaClient } from "#/prisma/client.js";

const ZONE = "Africa/Lagos";
const LIST_CAP = 15;

type Status = "new" | "returning" | "idle" | "quiet";

type Row = {
	id: string;
	name: string;
	created_at: Date;
	joined_date: string;
	total_all: number;       // every entry ever, by logged_at
	total_asof: number;      // entries logged on or before `date`
	entries_day: number;
	tagged_day: number;
	entries_prev_day: number;
	first_date: string | null;
	days_since_last_log: number | null;
};

type DigestUser = {
	id: string;
	name: string;
	status: Status;
	entries_day: number;
	tagged_day: number;
	entries_prev_day: number;
	days_since_last_log: number;
	total_entries: number;
};

class DailyStats {
	static STATUS_LABEL: Record<Status, string> = { new: "NEW", returning: "BACK", idle: "IDLE", quiet: "QUIET" };
	static STATUS_ORDER: Record<Status, number> = { returning: 0, new: 1, idle: 2, quiet: 3 };

	static KEY = [
		"KEY",
		"Joined = signed up that day",
		"Activated = of those who joined, how many logged something",
		"Returning = joined earlier and logged that day and on an earlier day too",
		"Tag rate = share of that day's entries that had a tag",
		"NEW = this was their first day logging",
		"BACK = logged that day and on an earlier day",
		"IDLE = didn't log that day, but logged the day before",
		"QUIET = no log for 2+ days"
	].join("\n");
	
	static lastLog = (days: number) => days === 0 ? "that day" : `${DailyStats.plural(days, "day")} ago`;
	static plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
	static display = (u: { id: string; name: string }) => u.name?.trim() || u.id.slice(0, 6);
	
	// "a, b, c, +4 more" once a list passes the cap
	static capNames(names: string[]) {
		if (names.length <= LIST_CAP) return names.join(", ");
		return `${names.slice(0, LIST_CAP).join(", ")}, +${names.length - LIST_CAP} more`;
	}
	
	// `date` (YYYY-MM-DD, Lagos) is optional, handy for testing. Defaults to yesterday in Lagos.
	static async run(
		prisma: PrismaClient,
		date: string = DateTime.now().setZone(ZONE).minus({ days: 1 }).toISODate()!
	): Promise<string> {
		const excluded = [
			'5fdeb26e-2ab1-4cbe-90c8-e5e9f93f44a1'
		];

		const launch_events: { date: string; label: string }[] = [
			
		]

		// "logged_at" = Transaction.created_at. Everything is converted to Lagos before comparing.
		const rows = await prisma.$queryRaw<Row[]>`
			WITH u AS (
				SELECT id, name, created_at
				FROM "User"
				WHERE id <> ALL(${excluded}::text[])
			),
			l AS (
				SELECT
					t.user_id,
					(t.created_at AT TIME ZONE ${ZONE})::date AS d,
					t.tag_id
				FROM "Transaction" t
				JOIN u ON u.id = t.user_id
			)
			SELECT
				u.id,
				u.name,
				u.created_at,
				to_char((u.created_at AT TIME ZONE ${ZONE})::date, 'YYYY-MM-DD') AS joined_date,
				COUNT(l.d)::int AS total_all,
				COUNT(l.d) FILTER (WHERE l.d <= ${date}::date)::int AS total_asof,
				COUNT(l.d) FILTER (WHERE l.d = ${date}::date)::int AS entries_day,
				COUNT(l.tag_id) FILTER (WHERE l.d = ${date}::date)::int AS tagged_day,
				COUNT(l.d) FILTER (WHERE l.d = ${date}::date - 1)::int AS entries_prev_day,
				to_char(MIN(l.d) FILTER (WHERE l.d <= ${date}::date), 'YYYY-MM-DD') AS first_date,
				(${date}::date - MAX(l.d) FILTER (WHERE l.d <= ${date}::date))::int AS days_since_last_log
			FROM u
			LEFT JOIN l ON l.user_id = u.id
			GROUP BY u.id, u.name, u.created_at
			ORDER BY u.created_at ASC
		`;

		let joined_count = 0;
		let activated_count = 0;
		let returning_count = 0;
		let entries_total = 0;
		let entries_tagged = 0;

		const users: DigestUser[] = [];
		const never_logged: { id: string; name: string }[] = [];
		const gone_quiet: { id: string; name: string }[] = [];

		for (const r of rows) {
			if (r.joined_date === date) {
				joined_count++;
				if (r.total_all > 0) activated_count++; // all-time, "by the time the endpoint runs"
			}

			// never logged anything, ever (only people who had joined by the end of `date`)
			if (r.total_all === 0) {
				if (r.joined_date <= date) never_logged.push({ id: r.id, name: r.name });
				continue;
			}

			// first log happened after `date`, so they don't exist yet as of that day
			if (r.total_asof === 0) continue;

			entries_total += r.entries_day;
			entries_tagged += r.tagged_day;

			const days_since = r.days_since_last_log!;
			const status: Status =
				r.entries_day > 0
					? (r.first_date === date ? "new" : "returning")
					: (days_since === 1 ? "idle" : "quiet");

			if (status === "returning") returning_count++;
			if (days_since >= 2) gone_quiet.push({ id: r.id, name: r.name });

			users.push({
				id: r.id,
				name: r.name,
				status,
				entries_day: r.entries_day,
				tagged_day: r.tagged_day,
				entries_prev_day: r.entries_prev_day,
				days_since_last_log: days_since,
				total_entries: r.total_asof
			});
		}

		users.sort((a, b) =>
			DailyStats.STATUS_ORDER[a.status] - DailyStats.STATUS_ORDER[b.status] || b.entries_day - a.entries_day
		);

		// ---------- build the message ----------
		
		const day = DateTime.fromISO(date, { zone: ZONE }).setLocale("en");
		const day_label = day.toFormat("ccc d LLL");
		
		// launch markers: the digest date or the 2 days before it
		const window_start = day.minus({ days: 2 }).toISODate()!;
		const launches = launch_events.filter(e => e.date >= window_start && e.date <= date);
		
		const header = [`📊 Digest for ${day_label}`, ...launches.map(e => `📌 Launch: ${e.label}`)];
		
		const summary = [
			`Joined: ${joined_count}`,
			`Activated: ${activated_count} of ${joined_count}`
		];
		
		if (entries_total === 0) {
			summary.push("Nobody logged anything.");
		} else {
			const pct = Math.round((entries_tagged / entries_total) * 100);
			summary.push(
				`Returning: ${returning_count}`,
				`Tag rate: ${entries_tagged} of ${DailyStats.plural(entries_total, "entry").replace("entrys", "entries")} (${pct}%)`
			);
		}
		
		const sections: string[] = [header.join("\n"), DailyStats.KEY, summary.join("\n")];
		
		// per user
		if (users.length === 0) {
			sections.push("PER USER\n\nNobody has logged yet.");
		} else {
			const blocks = users.slice(0, LIST_CAP).map(u => [
				`${DailyStats.display(u)} (${DailyStats.STATUS_LABEL[u.status]})`,
				u.entries_day > 0
					? `Entries: ${u.entries_day} (${u.tagged_day} tagged)`
					: "Entries: 0",
				`Day before: ${u.entries_prev_day}`,
				`Last log: ${DailyStats.lastLog(u.days_since_last_log)}`,
				`Total: ${u.total_entries}`
			].join("\n"));
		
			if (users.length > LIST_CAP) blocks.push(`+${users.length - LIST_CAP} more`);
		
			sections.push(`PER USER\n\n${blocks.join("\n\n")}`);
		}
		
		// call list
		sections.push(
			[
				"CALL LIST",
				`Signed up, never logged:\n${never_logged.length ? DailyStats.capNames(never_logged.map(DailyStats.display)) : "none"}`,
				`Gone quiet (2+ days):\n${gone_quiet.length ? DailyStats.capNames(gone_quiet.map(DailyStats.display)) : "none"}`
			].join("\n\n")
		);
		
		return sections.join("\n\n");
	}
}

export default DailyStats;