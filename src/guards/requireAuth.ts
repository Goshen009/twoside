import { APIError } from '#/errors/APIError.js';
import { Prisma } from '#/prisma/client.js';
import { JWT } from '#/libs/index.js';
import fp from 'fastify-plugin';

export default fp(async (fastify) => {
	// cache the user receieved from the db
	fastify.decorateRequest('_user', null);
	
	fastify.decorateRequest('requireAuth', async function() {
		if (this._user) return this._user; // return cached result
		
		const { id } = JWT.verify(this.server.config, this.headers);
		
		const user = await this.server.prisma.user.findUnique({
			where: { id },
			select: { 
				id: true,
				username: true,
				accounts: true
			},
		})
		
		if (!user)
			throw APIError.invalidOrMissingToken();

		const recievables_account_id = user.accounts.find(a => a.default === 'RECEIVABLES')?.id;
		const payables_account_id = user.accounts.find(a => a.default === 'PAYABLES')?.id;

		if (!recievables_account_id || !payables_account_id)
	  throw APIError.custom({ status: 400, message: "User is missing required default accounts" });
			
		const authenticated_user: AuthenticatedUser = {
		  ...user,
		  defaults: { recievables_account_id, payables_account_id }
		};
		
		this._user = authenticated_user as AuthenticatedUser;  // cache it
		return authenticated_user as AuthenticatedUser;
	});
})

export type AuthenticatedUser = Prisma.UserGetPayload<{
	select: {
		id: true,
		username: true,
		accounts: true
	}
}> & { 
	defaults: {
		recievables_account_id: string,
		payables_account_id: string
	}
};

declare module 'fastify' {
	export interface FastifyRequest {
		_user: null | AuthenticatedUser,
		requireAuth(): Promise<AuthenticatedUser>
	}
}