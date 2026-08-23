import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

const schema = z.object({
  show_inactive: z.enum(["true", "false"]).default("false").transform(v => v === "true")
});
async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Querystring: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

	const { show_inactive } = request.query;

	const accounts = await this.prisma.account.findMany({
		where: { 
			user_id: user.id,
			system_role: null,
			...(!show_inactive && { is_active: true })
		}
	});
	
  return reply.code(200).send({
  	accounts: accounts.map(a => ({
   		id: a.id,
     	name: a.name,
      type: a.type,
      is_active: a.is_active,
   	}))
  });
}

export const list_accounts = { handler, schema: { querystring: schema } };