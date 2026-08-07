import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

const schema = z.object({
	show_disabled: z.boolean().default(false)
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Querystring: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

	const { show_disabled } = request.query;

	const accounts = await this.prisma.account.findMany({
		where: { 
			user_id: user.id,
			...(!show_disabled && { is_disabled: false } )
		}
	});
	
  return reply.code(200).send({
  	accounts: accounts.map(a => ({
   		id: a.id,
     	name: a.name,
      default: a.default
   	}))
  });
}

export const list_accounts = { handler, schema: { querystring: schema } };