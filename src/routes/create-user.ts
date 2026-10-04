import Tokens from "#/libs/tokens.js";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

const schema = z.object({
	name: z.string()
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  const { name } = request.body;

  const user = await this.prisma.user.create({
  	data: {
	 		name,
	   	timezone: 'Africa/Lagos',
	    accounts: {
				createMany: {
					data: [
						{ name: "Wallets", type: "ASSET" },
						{ name: "Expense", type: "EXPENSE" }
					]
				}
			}
   	}
  });

  const access_token = Tokens.generateAccessToken(this.config, { id: user.id });

  return reply.code(200).send({ access_token });
}

export const create_user = { handler, schema: { body: schema } };