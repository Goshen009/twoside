import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

const schema = z.object({
  endpoint: z.httpUrl(),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();
	
  const { endpoint } = request.body;

  // deleteMany instead of delete cause this does not throw. 
  // if there is no subscription found with this endpoint, just throw a 200
  await this.prisma.webPushSubscription.deleteMany({
    where: { endpoint, user_id: user.id }
  });

  return reply.code(200).send({});
}

export const delete_webpush_subscription = { handler, schema: { body: schema } };