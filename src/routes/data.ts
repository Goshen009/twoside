import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

async function handler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

	const categories = user.categories.filter(c => c.is_active);
	const counterparties = user.counterparties.filter(c => c.is_active);
	
  return reply.code(200).send({
  	currency: "₦",  // hard-coded for now
   	IANA: "Africa/Lagos", // also hardcoded for now
    categories,
    counterparties
  });
}

export const data = { handler };