import { APIError } from '#/errors/APIError.js';
import { Prisma } from '#/prisma/client.js';

import fp from 'fastify-plugin';
import Tokens from '#/libs/tokens.js';

export default fp(async (fastify) => {
	fastify.decorateRequest('requireAuth', async function() {		
		const { id } = Tokens.verifyAccessToken(this.server.config, this.headers);

		const user = await this.server.prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				timezone: true,
				accounts: {
					select: { id: true, type: true, name: true }
				},
				tags: {
					select: { id: true, name: true, lowercase_name: true }
				}
			}
		});

		if (!user)
			throw APIError.invalidOrMissingToken();

		return user;
	});
})

export type AuthenticatedUser = Prisma.UserGetPayload<{
	select: {
		id: true,
		name: true,
		timezone: true,
		accounts: {
			select: { id: true, type: true, name: true }
		},
		tags: {
			select: { id: true, name: true, lowercase_name: true }
		}
	}
}>;

declare module 'fastify' {
	export interface FastifyRequest {
		requireAuth(): Promise<AuthenticatedUser>
	}
}