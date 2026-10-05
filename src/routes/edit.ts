import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { Prisma } from "#/prisma/client.js";
import { z } from "zod/v4";
import { APIError } from "#/errors/APIError.js";

const schema = z.object({
	transaction_id: z.uuid(),
	description: z.string().min(1, "Description is required").max(100, "Description cannot be more than 100 letters.").optional(),
	amount: z.number().positive("Amount must be greater than 0").max(9_999_999_999).multipleOf(0.01).optional(),
	transaction_date: z.iso.datetime().optional(),
	tag: z.string().trim().min(1).nullable().optional() // string = set, null = remove, omitted = leave alone
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

  const { transaction_id, description, amount, transaction_date, tag } = request.body;

  // undefined = don't touch, null = clear the tag, string = find or create it
  let tag_id: string | null | undefined;
  if (tag === null) {
    tag_id = null;
  } else if (tag) {
    tag_id = (await this.prisma.tag.upsert({
      where: { user_id_lowercase_name: { user_id: user.id, lowercase_name: tag.toLowerCase() } },
      update: {},
      create: { name: tag, lowercase_name: tag.toLowerCase(), user_id: user.id }
    })).id;
  }

  try {
    await this.prisma.transaction.update({
      where: { id: transaction_id, user_id: user.id },
      data: {
        description,
        transaction_date,
        tag_id,
        ...(amount &&{
        	entries: { updateMany: { where: {  }, data: { amount } } }
        })
      }
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      throw APIError.notFound("Transaction not found.");
    }
    throw e;
  }

  return reply.code(200).send({});
}

export const edit = { handler, schema: { body: schema } };