import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

const schema = z.object({
	description: z.string().min(1, "Description is required").max(100, "Description cannot be more than 100 letters."),
	amount: z.number().positive("Amount must be greater than 0").multipleOf(0.01),
	transaction_date: z.iso.datetime(),
	tag: z.string().trim().min(1).optional()
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();
	
  const { description, amount, transaction_date, tag } = request.body;

 	const wallet_account_id = user.accounts.find(a => a.name === 'Wallet')!.id;
	const expense_account_id = user.accounts.find(a => a.name === 'Expense')!.id;

	const tag_id = tag
		?	(await this.prisma.tag.upsert({
				where: { user_id_lowercase_name: { user_id: user.id, lowercase_name: tag.toLowerCase() } },
				update: { },
				create: { name: tag, lowercase_name: tag.toLowerCase(), user_id: user.id }
			})).id
		: null;

  await this.prisma.transaction.create({
  	data: {
      tag_id,
   		description,
     	transaction_date,
      user_id: user.id,
      entries: {
      	createMany: {
       		data: [
         		{
             	amount,
           		side: 'CREDIT',
             	account_id: wallet_account_id
           	},
            {
            	amount,
             	side: 'DEBIT',
              account_id: expense_account_id
            }
         	]
       	}
      }
   	}
  });

  return reply.code(200).send({});
}

export const record = { handler, schema: { body: schema } };