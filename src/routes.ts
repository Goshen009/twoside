import { FastifyPluginAsync } from 'fastify';

import { seed } from './routes/seed.js';
import { login } from './routes/login.js';
import { list_loans } from './routes/list-loans.js';
import { register_user } from './routes/register.js';
import { list_accounts } from './routes/list-accounts.js';
import { log_transaction } from './routes/log-transaction.js';
import { list_categories } from './routes/list-categories.js';
import { allocate_budget } from './routes/allocate-budget.js';
import { create_category } from './routes/create-category.js';
import { fetch_allocations } from './routes/fetch-allocations.js';
import { fetch_transactions } from './routes/fetch-transactions.js';
import { create_counterparty } from './routes/create-counterparty.js';
import { list_counterparties } from './routes/list-counterparties.js';
import { generate_budget_report } from './routes/generate-budget-report.js';
import { generate_account_balance } from './routes/generate-account-balance.js';
import { fetch_expenses_by_category } from './routes/fetch-expenses-by-category.js';
import { test_gemini_chat } from './routes/test-gemini-chat.js';
import { list_test_chats } from './routes/list-test-chats.js';
import { log_transfer } from './routes/logs/log-transfer.js';

const routes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {  
  	return { root: true }
  });

  // IT IS VERY IMPORTANT THAT YOU DO NOT FORGET
  // WE STILL NEED TO WRITE UP THE CRON JOB FOR CREATING SNAPSHOTS
  
  fastify.get("/seed", seed);
  fastify.post("/test/gemini-chat", test_gemini_chat);
  fastify.get("/test/gemini-chat", list_test_chats);

  fastify.post("/login", login);
  fastify.post("/register", register_user);


  fastify.post("/log/expense", );
  fastify.post("/log/income", );
  fastify.post("/log/transfer", log_transfer);
  fastify.post("/log/loan", );
  fastify.post("/log/borrow", );
  fastify.post("/log/loan-repayed", );
  fastify.post("/log/borrow-returned", );
  
  

  fastify.post("/budget", allocate_budget);
  fastify.post("/categories", create_category);
  fastify.post("/transactions", log_transaction);
  fastify.post("/counterparties", create_counterparty);

  fastify.get("/loans", list_loans);
  fastify.get("/accounts", list_accounts);
  fastify.get("/categories", list_categories);
  fastify.get("/counterparties", list_counterparties);
  fastify.get("/report/budget", generate_budget_report);
  fastify.get("/report/balances", generate_account_balance);
  fastify.get("/allocations/:category_id", fetch_allocations);
  fastify.get("/transactions/:account_id", fetch_transactions);
  fastify.get("/expenses/:category_id", fetch_expenses_by_category);
}

export default routes