import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

const schema = z.object({
  status: z.enum(["OPEN", "PARTIALLY_REPAID", "CLOSED"]).optional(),
  direction: z.enum(["GIVEN", "BORROWED"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Querystring: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();
  const messages = await this.prisma.testChatMessage.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'asc' }
  });
  // group into { chat_id, messages[] }
  const grouped = new Map<string, typeof messages>();
  for (const m of messages) {
    const list = grouped.get(m.chat_id) ?? [];
    list.push(m);
    grouped.set(m.chat_id, list);
  }
  return reply.code(200).send({
    chats: [...grouped.entries()].map(([chat_id, msgs]) => ({
      chat_id,
      preview: msgs[0]?.content.slice(0, 50) ?? "",
      message_count: msgs.length
    }))
  });
}

export const list_test_chats = { handler };