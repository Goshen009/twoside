import { PrismaClient } from "#/prisma/client.js";
import { Config } from "#/plugins/env.js";
import webpush from 'web-push';

export interface NotificationPayload {
	title: string,
	body: string,
}

export interface PushSubscriptionRow {
	endpoint: string;
	p256dh: string;
	auth: string;
}

// One person, all their devices, and what to tell them.
export interface PushTarget {
	subscriptions: PushSubscriptionRow[];
	payload: NotificationPayload;
}

async function mapPool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>) {
	const results = new Array<PromiseSettledResult<R>>(items.length);
	let next = 0;

	const worker = async () => {
		while (next < items.length) {
			const i = next++;
			try {
				results[i] = { status: "fulfilled", value: await fn(items[i]!) };
			} catch (reason) {
				results[i] = { status: "rejected", reason };
			}
		}
	};

	await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
	return results;
}

class Webpush {
	static async sendPushNotifications(prisma: PrismaClient, config: Config, messages: Map<string, NotificationPayload>) {
		const subscriptions = await prisma.webPushSubscription.findMany({
			where: { user_id: { in: [...messages.keys()] } }
		});
	
		const targets: PushTarget[] = [];
		for (const [user_id, payload] of messages) {
			targets.push({ payload, subscriptions: subscriptions.filter((s) => s.user_id === user_id) });
		}
	
		await Webpush.sendToTargets(prisma, config, targets);
	}

	static async sendToTargets(prisma: PrismaClient, config: Config, targets: PushTarget[]) {
		const jobs = targets.flatMap((t) => t.subscriptions.map((sub) => ({ sub, body: JSON.stringify(t.payload) })) );
		if (jobs.length === 0) return;

		console.log(jobs);
	
		const results = await mapPool(jobs, 20, ({ sub, body }) =>
			webpush.sendNotification(
				{ endpoint: sub.endpoint,
					keys: { p256dh: sub.p256dh, auth: sub.auth }
				},
				body,
				{
					urgency: "normal",
					timeout: 10_000,
					vapidDetails: {
						subject: config.VAPID_MAILTO,
						publicKey: config.VAPID_PUBLIC_KEY,
						privateKey: config.VAPID_PRIVATE_KEY
					}
				}
			)
		);

		console.log(results);
	
		const expired: string[] = [];
		results.forEach((r, i) => {
			if (r.status !== "rejected") return;
			const status = r.reason?.statusCode;
			const endpoint = jobs[i]!.sub.endpoint;
	
			if (status === 404 || status === 410) expired.push(endpoint);
			else console.warn("push failed", new URL(endpoint).host, status ?? r.reason?.code ?? r.reason?.message);
		});

		console.log(expired);
	
		if (expired.length > 0) {
			await prisma.webPushSubscription.deleteMany({ where: { endpoint: { in: expired } } });
		}
	}
}

export default Webpush;