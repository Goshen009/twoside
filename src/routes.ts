import { FastifyPluginAsync } from 'fastify';

import { query } from './routes/query.js';
import { create_user } from './routes/create-user.js';
import { login } from './routes/login.js';

const routes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {  
  	return { root: true }
  });

  fastify.get("/total-today", query);
  fastify.post("/create", create_user);
  fastify.post("/login", login)
}

export default routes