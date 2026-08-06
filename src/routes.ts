import { FastifyPluginAsync } from 'fastify';

import { seed } from './routes/seed.js';
import { login } from './routes/login.js';
import { register_user } from './routes/register.js';
import { new_transaction } from './routes/new-transaction.js';

const routes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {  
  	return { root: true }
  });

  fastify.get("/seed", seed);

  fastify.post("/login", login);
  fastify.post("/register", register_user);
  fastify.post("/transactions", new_transaction);
}

export default routes