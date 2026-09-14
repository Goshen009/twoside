import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

import Tokens from "#/libs/tokens.js";
import OTP from "#/libs/otp.js";

const schema = z.object({
	email: z.email().trim(),
	otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits")
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  const { email, otp } = request.body;

  await OTP.verify(this.prisma, otp, email);

  const balance_snapshots = {
  	create: [
   		{ balance: 0, as_of_date: new Date() }
   	]
  };

  const user = await this.prisma.user.upsert({
  	where: { email },
   	create: { 
    	email,
    	categories: {
		   	create: [
		      { name: "Charges", lowercase_name: "charges", is_charge: true }
		   	]
     	},
      accounts: {
		  	create: [
					{ name: 'Cash', type: 'ASSET', system_role: null, balance_snapshots },
					{ name: 'Bank', type: 'ASSET', system_role: null, balance_snapshots },
					{ name: 'Savings', type: 'ASSET', system_role: null, balance_snapshots },
					{ name: 'Equity', type: 'EQUITY', system_role: 'EQUITY', balance_snapshots },
					{ name: 'Income', type: 'INCOME', system_role: 'INCOME', balance_snapshots },
					{ name: 'Expense', type: 'EXPENSE', system_role: 'EXPENSE', balance_snapshots },
					{ name: 'Payables', type: 'LIABILITY', system_role: 'PAYABLES', balance_snapshots },
					{ name: 'Recieveables', type: 'ASSET', system_role: 'RECEIVABLES', balance_snapshots },
			  ]
      }
    },
    update: { },
    select: { id: true, profile: { select: { user_id: true } } }
  });

  const { access_token, refresh_token } = await Tokens.create(this.prisma, this.config, user.id);

  return reply
  	.header('authorization', `Bearer ${access_token}`)
   	.setCookie('refresh_token', refresh_token, Tokens.COOKIE_CONFIG(this.config))
  	.code(200)
   	.send({ 
    	message: "Successfully verified!", 
     	requires_onboarding: !user.profile,
      ...(this.config.ENVIRONMENT !== 'production' && { refresh_token })
    });
}

export const verify_otp = { handler, schema: { body: schema } };