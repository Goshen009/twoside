import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import Password from "#/libs/password.js";

async function handler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
	const password = await Password.hash('000000');
	
	await this.prisma.user.create({
		data: {
			id: '245baa2f-cefe-45ad-8505-9278fe7cf4c4',
			username: 'goshen',
			password,
			accounts: {
				create: [
		    	{ id: 'd723526b-a310-4547-adb7-c81268eaab10', name: 'Cash', type: 'ASSET', default: 'CASH' },
		   		{ id: '15b6e49e-4a46-4baf-80ad-318aede7ec08', name: 'Bank', type: 'ASSET', default: 'BANK' },
					{ id: '83224d56-f446-41ac-9be6-c1dfb7f9b4ed', name: 'Equity', type: 'EQUITY', default: null },
					{ id: '1ff66614-20d5-45ef-b3cd-d9113e932631', name: 'Savings', type: 'ASSET', default: null },
					{ id: '46f82990-f780-4001-bb25-cb71d37d1b50', name: 'Income', type: 'INCOME', default: 'INCOME' },
					{ id: '3a89a48a-78db-4df9-afae-9ad243346bfc', name: 'Expense', type: 'EXPENSE', default: 'EXPENSE' },
					{ id: '9ab21468-981f-421c-8d7f-b3d3121522ab', name: 'Payables', type: 'LIABILITY', default: 'PAYABLES' },
					{ id: '5e07e4d2-ec56-4689-b442-22876237f2a4', name: 'Recieveables', type: 'ASSET', default: 'RECEIVABLES' },
		    ]
      },
      categories: {
      	create: [
     			{ id: 'ffd00ace-32df-4f72-951a-89910a0d0f01', name: 'Transport' },
       		{ id: 'c37d6886-8b98-4df5-9ac6-439d34e8fdde', name: 'Internet' }
       	]
      }
		}
	});
	
  return reply.code(201).send({ message: "Success!" });
}

export const seed = { handler };