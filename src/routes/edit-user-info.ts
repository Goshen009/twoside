import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

import SupportedLocales from "#/libs/supported-locales.js";

const schema = z.object({
	name: z.string().trim().min(1, "Name is required").max(50, "Name cannot be more than 50 letters").optional(),
	currency_symbol: z.enum(SupportedLocales.SUPPORTED_CURRENCY_SYMBOLS).optional(),
	timezone: z.enum(SupportedLocales.SUPPORTED_TIMEZONES).optional(),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();
	
  const { name, currency_symbol, timezone } = request.body;

  await this.prisma.user.update({
  	where: { id: user.id },
  	data: { 
   		name, currency_symbol, timezone
   	}
  });

  return reply.code(200).send({});
}

export const edit_user_info = { handler, schema: { body: schema } };