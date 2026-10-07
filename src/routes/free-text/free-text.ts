import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

const schema = z.object({
	text: z.string()
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  // const { text } = request.body;

  

  return reply.code(200).send({});
}

// const amount_parser = (text: string) => {
	
// };

// interface Good {
// 	status: 'Matched',
// 	amount: number
// }

// interface None {
// 	status: 'No Match',
// }

// interface KindOf {
// 	status: 'Possibilty',
// 	amount: number,
// 	string: string
// }
// interface Multiple {
// 	status: "Many matches",
// 	amount: number[]
// }

export const free_text = { handler, schema: { body: schema } };