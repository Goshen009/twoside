import { Account, Category, Prisma, SystemAccountRole } from '#/prisma/client.js';
import { APIError } from '#/errors/APIError.js';

import fp from 'fastify-plugin';
import Tokens from '#/libs/tokens.js';

type SystemAccountMap = Partial<Record<SystemAccountRole, Account>>;

export default fp(async (fastify) => {
	fastify.decorateRequest('requireAuth', async function() {		
		const { id } = Tokens.verifyAccessToken(this.server.config, this.headers);
		
		const user = await this.server.prisma.user.findUnique({
			where: { id },
			select: { 
				id: true,
				username: true,
				accounts: true,
    		iana_timezone: true,
				currency_symbol: true,
				categories: { where: { is_charge: true } }
			},
		})
		
		if (!user)
			throw APIError.invalidOrMissingToken();

		const system_accounts = user.accounts.reduce<SystemAccountMap>((acc, account) => {
			if (account.system_role) acc[account.system_role] = account;
			return acc;
		}, {});

		if (!system_accounts.RECEIVABLES || !system_accounts.PAYABLES || !system_accounts.INCOME || !system_accounts.EXPENSE)
      throw APIError.custom({ status: 409, message: "User is missing required system accounts" });

		const charge_category = user.categories.find(c => c.is_charge);
		if (!charge_category)
			throw APIError.custom({ status: 409, message: "User is missing required charge category" });
		
		const authenticated_user: AuthenticatedUser = {
		  ...user,
			charge_category,
		  system_accounts
		};
	
		return authenticated_user;
	});
})

export type AuthenticatedUser = Prisma.UserGetPayload<{
	select: {
		id: true,
		username: true,
		accounts: true,
    iana_timezone: true,
		currency_symbol: true,
		categories: { where: { is_charge: true } },
	}
}> & {
	charge_category: Category,
	system_accounts: SystemAccountMap
};

declare module 'fastify' {
	export interface FastifyRequest {
		requireAuth(): Promise<AuthenticatedUser>
	}
}