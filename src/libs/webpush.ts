import { PrismaClient } from "#/prisma/client.js";
import { Config } from "#/plugins/env.js";
import webpush from 'web-push';
import pLimit from 'p-limit';

export interface NotificationPayload {
	title: string,
	body: string,
}

const limit = pLimit(20);

class Webpush {
	static async sendPushNotifications(prisma: PrismaClient, config: Config, messages: Map<string, NotificationPayload>) {
		const subscriptions = await prisma.webPushSubscription.findMany({
			where: { user_id: { in: [...messages.keys()] } }
		});

		const results = await Promise.allSettled(
			subscriptions.map(sub => 
				limit(() => webpush.sendNotification(
					{
						endpoint: sub.endpoint,
						keys: { p256dh: sub.p256dh, auth: sub.auth }
					},
					JSON.stringify(messages.get(sub.user_id)!),
					{
						urgency: 'normal',
						timeout: 10_000,
						vapidDetails: {
							subject: config.VAPID_MAILTO,
					   	publicKey: config.VAPID_PUBLIC_KEY,
					    privateKey: config.VAPID_PRIVATE_KEY
						}
					}
				))
			)
		);

		const expired_subscriptions = results.map((result, i) => {
			if (result.status === 'rejected') {
				const status = result.reason?.statusCode;
				if (status === 404 || status === 410) return subscriptions[i]?.endpoint
			}
		}).filter(Boolean) as string[];

		await prisma.webPushSubscription.deleteMany({
			where: { endpoint: { in: expired_subscriptions } }
		});
	}
}

export default Webpush;