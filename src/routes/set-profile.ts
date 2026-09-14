import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

import SupportedLocales from "#/libs/supported-locales.js";
import Tokens from "#/libs/tokens.js";

const schema = z.object({
	username: z.string("Username must be a string").min(1, "Username must be at least 1 letter.").max(40, "Username cannot be more than 40 letters.").trim(),
	iana_timezone: z.enum(SupportedLocales.SUPPORTED_TIMEZONES),
	currency_symbol: z.enum(SupportedLocales.SUPPORTED_CURRENCY_SYMBOLS)
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const { id } = Tokens.verifyAccessToken(this.config, request.headers);

  const { username, iana_timezone, currency_symbol } = request.body;

	await this.prisma.profile.upsert({
		where: { user_id: id },
		create: { username, iana_timezone, currency_symbol, user_id: id },
		update: { username, iana_timezone, currency_symbol }
	});

  return reply.code(200).send({ message: "Successful!" });
}

export const set_profile = { handler, schema: { body: schema } };