import { FastifyPluginAsync } from 'fastify';

import { edit_user_info } from './routes/edit-user-info.js';
import { get_user_info } from './routes/get-user-info.js';
import { login } from './routes/login.js';

import { add_transaction } from './routes/add-transaction.js';
import { get_transactions } from './routes/get-transactions.js';
import { edit_transaction } from './routes/edit-transaction.js';
import { delete_transaction } from './routes/delete-transaction.js';

import { edit_tag } from './routes/edit-tag.js';
import { merge_tag } from './routes/merge-tag.js';
import { delete_tag } from './routes/delete-tag.js';

import { get_google_auth_url } from './routes/get-google-auth-url.js';
import { google_callback } from './routes/google-callback.js';
import { refresh } from './routes/refresh.js';
import { logout } from './routes/logout.js';

const routes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {  
  	return { environment: this.config.ENVIRONMENT }
  });

  fastify.get("/google/auth-url", get_google_auth_url);
  fastify.post("/google/callback", google_callback);
  fastify.post("/refresh", refresh);
  fastify.post("/logout", logout);
  
  fastify.get("/info", get_user_info);
  fastify.patch("/info", edit_user_info);
  
  fastify.get("/transactions", get_transactions);
  fastify.post("/transaction", add_transaction);
  fastify.patch("/transaction/:transaction_id", edit_transaction);
  fastify.delete("/transaction/:transaction_id", delete_transaction);

  fastify.patch("/tag/:tag_id", edit_tag);
  fastify.delete("/tag/:tag_id", delete_tag);
  fastify.post("/tag/:tag_id/merge", merge_tag);
  
  fastify.post("/login", login);
}

export default routes