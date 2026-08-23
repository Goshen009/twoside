import { FastifyPluginAsync } from 'fastify';

import { seed } from './routes/seed.js';
import { login } from './routes/working/login.js';
import { list_loans } from './routes/working/list-loans.js';
import { register_user } from './routes/working/register.js';
import { list_accounts } from './routes/working/list-accounts.js';
import { list_categories } from './routes/working/list-categories.js';
import { list_counterparties } from './routes/working/list-counterparties.js';
import { log_transfer } from './routes/logs/log-transfer.js';
import { log_expense } from './routes/logs/log-expense.js';
import { log_income } from './routes/logs/log-income.js';
import { log_give_loan } from './routes/logs/log-give-loan.js';
import { log_borrow } from './routes/logs/log-borrow.js';
import { log_repay_loan } from './routes/logs/log_repay_loan.js';
import { log_receive_repayment } from './routes/logs/log_receive_repayment.js';
import { create_account } from './routes/working/create-account.js';
import { toggle_account_status } from './routes/working/toggle-account-status.js';
import { toggle_category_status } from './routes/working/toggle-category-status.js';
import { toggle_counterparty_status } from './routes/working/toggle-counterparty-status.js';
import { get_balances } from './routes/working/get-balances.js';
import { get_transaction_group } from './routes/working/get-transaction-group.js';
import { get_account_summary } from './routes/working/get-account-summary.js';
import { list_transactions } from './routes/working/list-transactions.js';
import { get_loan_repayment } from './routes/working/get-loan-repayments.js';
import { get_loan } from './routes/working/get-loan.js';
import { get_loans_summary } from './routes/working/get-loans-summary.js';
import { get_category_summary } from './routes/working/get-category-summary.js';
import { get_counterparty_loans } from './routes/working/get-counterparty-loans.js';
import { list_category_transactions } from './routes/working/list-category-transactions.js';
import { create_category } from './routes/working/create-category.js';
import { create_counterparty } from './routes/working/create-counterparty.js';

const routes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {  
  	return { root: true }
  });

  // IT IS VERY IMPORTANT THAT YOU DO NOT FORGET
  // WE STILL NEED TO WRITE UP THE CRON JOB FOR CREATING SNAPSHOTS
  
  fastify.get("/seed", seed);

  fastify.post("/login", login);
  fastify.post("/register", register_user);

  fastify.post("/log/expense", log_expense);
  fastify.post("/log/income", log_income);
  fastify.post("/log/transfer", log_transfer);
  fastify.post("/log/loan", log_give_loan);
  fastify.post("/log/borrow", log_borrow);
  fastify.post("/log/loan-repayed", log_repay_loan);
  fastify.post("/log/borrow-returned", log_receive_repayment);
  
  fastify.get("/accounts", list_accounts);
  fastify.get("/categories", list_categories);
  fastify.get("/counterparties", list_counterparties);
  fastify.post("/accounts", create_account);
  fastify.post("/categories", create_category);
  fastify.post("/counterparties", create_counterparty);
  fastify.patch("/accounts/:account_id", toggle_account_status);
  fastify.patch("/categories/:category_id", toggle_category_status);
  fastify.patch("/counterparties/:counterparty_id", toggle_counterparty_status);

  fastify.get("/balances", get_balances);
  fastify.get("/transaction-groups/:group_id", get_transaction_group);
  
  fastify.get("/accounts/:account_id/summary", get_account_summary);
  fastify.get("/accounts/:account_id/transactions", list_transactions);

  fastify.get("/loans", list_loans);
  fastify.get("/loans/summary", get_loans_summary);
  fastify.get("/loans/:loan_id", get_loan);
  fastify.get("/loan-repayments/:repayment_id", get_loan_repayment);

  fastify.get("/counterparties/:counterparty_id/loans", get_counterparty_loans);
  fastify.get("/categories/:category_id/summary", get_category_summary);
  fastify.get("/categories/:category_id/transactions", list_category_transactions);
}

export default routes