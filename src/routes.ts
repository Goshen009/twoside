import { FastifyPluginAsync } from 'fastify';

import { query } from './routes/query.js';
import { create_user } from './routes/create-user.js';
import { login } from './routes/login.js';
import { record } from './routes/record.js';
import { transactions } from './routes/transactions.js';
import { edit } from './routes/edit.js';
import { remove } from './routes/remove.js';
import { get_user_info } from './routes/get-user-info.js';

const routes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {  
  	return { root: true }
  });

  fastify.get("/info", get_user_info);
  fastify.get("/transactions", transactions);

  fastify.get("/total-today", query);
  fastify.post("/create", create_user);
  fastify.post("/login", login);
  fastify.post("/record", record);
  fastify.post("/edit", edit);
  fastify.post("/remove/:transaction_id", remove);
}

export default routes