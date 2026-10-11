import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

import LineParser from "#/libs/free-text/LineParser.js";

const schema = z.object({
	text: z.string().min(1).max(200)
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  const { text } = request.body;

  const tags = [
		{ id: "1", name: "Transport" },
		{ id: "2", name: "Data Bundle" },
  ];

  return reply.code(200).send(
  	LineParser.parse(text, 0, { tags, timezone: "Africa/Lagos" }),
  );
}

export const free_text = { handler, schema: { body: schema } };