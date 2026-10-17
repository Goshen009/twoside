import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

const schema = z.object({
  subscription: z.object({
    endpoint: z.httpUrl(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string()
    })
  })
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();
	
  const { subscription } = request.body;

  await this.prisma.webPushSubscription.upsert({
  	where: { endpoint: subscription.endpoint },
   	update: { 
	   	p256dh: subscription.keys.p256dh,
	   	auth: subscription.keys.auth,
    	user_id: user.id
    },
    create: {
    	endpoint: subscription.endpoint,
    	p256dh: subscription.keys.p256dh,
    	auth: subscription.keys.auth,
      user_id: user.id
    }
  });

  const all_user_subscriptions = await this.prisma.webPushSubscription.findMany({
  	where: { user_id: user.id },
   	orderBy: { updated_at: 'desc' }
  });

  if (all_user_subscriptions.length > 2) {
  	const subscriptions_to_keep = all_user_subscriptions.slice(0, 2).map(s => s.id);
   	await this.prisma.webPushSubscription.deleteMany({
    	where: { user_id: user.id, id: { notIn: subscriptions_to_keep } }
    });
  }

  return reply.code(200).send({});
}

export const add_webpush_subscription = { handler, schema: { body: schema } };