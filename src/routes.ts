import { FastifyPluginAsync } from 'fastify';

import { seed } from './routes/seed.js';
import { login } from './routes/login.js';
import { register_user } from './routes/register.js';
import { list_accounts } from './routes/list-accounts.js';
import { log_transaction } from './routes/log-transaction.js';
import { list_categories } from './routes/list-categories.js';
import { allocate_budget } from './routes/allocate-budget.js';
import { fetch_allocations } from './routes/fetch-allocations.js';
import { fetch_transactions } from './routes/fetch-transactions.js';
import { generate_budget_report } from './routes/generate-budget-report.js';
import { generate_account_balance } from './routes/generate-account-balance.js';
import { fetch_expenses_by_category } from './routes/fetch-expenses-by-category.js';

const routes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {  
  	return { root: true }
  });

  // IT IS VERY IMPORTANT THAT YOU DO NOT FORGET
  // WE STILL NEED TO WRITE UP THE CRON JOB FOR CREATING SNAPSHOTS

  // FOR LIST ACCOUNTS AND LIST CATEGORIES
  // ADD IN A QUERY TO SHOW DISABLED

  // VERIFY THE SHOW DISABLED THINGY
  
  fastify.get("/seed", seed);

  fastify.post("/login", login);
  fastify.post("/register", register_user);

  fastify.post("/budget", allocate_budget);
  fastify.post("/transactions", log_transaction);

  fastify.get("/accounts", list_accounts);
  fastify.get("/categories", list_categories);
  fastify.get("/report/budget", generate_budget_report);
  fastify.get("/report/balances", generate_account_balance);
  fastify.get("/allocations/:category_id", fetch_allocations);
  fastify.get("/transactions/:account_id", fetch_transactions);
  fastify.get("/expenses/:category_id", fetch_expenses_by_category);
}

export default routes