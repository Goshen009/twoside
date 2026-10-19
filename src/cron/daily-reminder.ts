import { DateTime } from "luxon";
import { Config } from "#/plugins/env.js";
import { PrismaClient } from "#/prisma/client.js";
import Webpush, { type PushTarget } from "#/libs/webpush.js";

const WINDOW_MINUTES = 60;

interface DueUser extends PushTarget {
	id: string;
	name: string;
}

class DailyReminder {
	// `now` is injectable so you can test any moment without waiting for it.
	static async run(
		prisma: PrismaClient,
		config: Config,
		now: DateTime = DateTime.now()
	): Promise<void> {
		const users = await prisma.user.findMany({
			where: { webpush_subscriptions: { some: {} } }, // no devices, nothing to consider
			select: {
				id: true,
				name: true,
				timezone: true,
				reminder_minutes: true,
				last_reminded_on: true,
				webpush_subscriptions: { select: { endpoint: true, p256dh: true, auth: true } }
			}
		});

		console.log(users);

		const due: DueUser[] = [];

		for (const user of users) {
			const local = now.setZone(user.timezone);
			const today = local.toISODate();
			if (!today) continue;

			// 1. inside their window? (a window that runs past midnight is cut at midnight)
			const minutes = local.hour * 60 + local.minute;
			if (minutes < user.reminder_minutes || minutes >= user.reminder_minutes + WINDOW_MINUTES) continue;

			// 2. already reminded today?
			if (user.last_reminded_on === today) continue;

			// 3. already logged a spend today? (same day boundaries as get_user_info)
			const start = local.startOf("day");
			const logged = await prisma.entries.findFirst({
				where: {
					side: "DEBIT",
					account: { user_id: user.id },
					transaction: { transaction_date: { gte: start.toJSDate(), lt: start.plus({ days: 1 }).toJSDate() } }
				},
				select: { id: true }
			});
			if (logged) continue;

			// 4. claim: only one tick (or instance) can win this update
			const claimed = await prisma.user.updateMany({
				where: {
					id: user.id,
					OR: [{ last_reminded_on: null }, { last_reminded_on: { not: today } }]
				},
				data: { last_reminded_on: today }
			});
			if (claimed.count === 0) continue;

			due.push({
				id: user.id,
				name: user.name,
				subscriptions: user.webpush_subscriptions,
				payload: { title: "Twoside", body: "Don't forget to log today's spends." }
			});
		}

		console.log(due);
		
		if (due.length === 0) return;

		await Webpush.sendToTargets(prisma, config, due);
	}
}

export default DailyReminder;