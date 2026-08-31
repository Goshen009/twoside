import { FastifyPluginAsync } from 'fastify';

import { seed } from './routes/seed.js';
import { login } from './routes/auth/login.js';
import { list_loans } from './routes/list-loans.js';
import { register_user } from './routes/auth/register.js';
import { list_accounts } from './routes/list-accounts.js';
import { list_categories } from './routes/list-categories.js';
import { list_counterparties } from './routes/list-counterparties.js';
import { log_transfer } from './routes/logs/log-transfer.js';
import { log_expense } from './routes/logs/log-expense.js';
import { log_income } from './routes/logs/log-income.js';
import { log_give_loan } from './routes/logs/log-give-loan.js';
import { log_borrow } from './routes/logs/log-borrow.js';
import { log_repay_loan } from './routes/logs/log_repay_loan.js';
import { log_receive_repayment } from './routes/logs/log_receive_repayment.js';
import { create_account } from './routes/create-account.js';
import { toggle_account_status } from './routes/toggle-account-status.js';
import { toggle_category_status } from './routes/toggle-category-status.js';
import { toggle_counterparty_status } from './routes/toggle-counterparty-status.js';
import { get_balances } from './routes/get-balances.js';
import { get_transaction_group } from './routes/get-transaction-group.js';
import { get_account_summary } from './routes/get-account-summary.js';
import { list_transactions } from './routes/list-transactions.js';
import { get_loan_repayment } from './routes/get-loan-repayments.js';
import { get_loan } from './routes/get-loan.js';
import { get_loans_summary } from './routes/get-loans-summary.js';
import { get_category_summary } from './routes/get-category-summary.js';
import { get_counterparty_loans } from './routes/get-counterparty-loans.js';
import { list_category_transactions } from './routes/list-category-transactions.js';
import { create_category } from './routes/create-category.js';
import { create_counterparty } from './routes/create-counterparty.js';
import { logout } from './routes/auth/logout.js';
import { refresh } from './routes/auth/refresh.js';

const routes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {  
  	return { root: true }
  });

  // IT IS VERY IMPORTANT THAT YOU DO NOT FORGET
  // WE STILL NEED TO WRITE UP THE CRON JOB FOR CREATING SNAPSHOTS
  // 
  // IT IS VERY IMPORTANT THAT WE SHOW THE USERS ALL THE WARNINGS 
  // AT ONCE.
  // 
  // 
  // Let's add in a way to delete an account, category or counterparty if
  // it hasn't been referenced before.
  // 
  // Just tried transfering from one account into another. It allowed me freely even though
  // the amount I was transfering out was way more. I think we should add in a helper over
  // here. It won't block it 100% but we could probably add a field like "check_amount" in
  // each of the logs so it'll check the amount that you're transfering from 
  // and it it's over the amount, it'll just return an error
  // the UI will show it to the user and if the user says just do it, then it sends
  // the same request again but check is set to false.
  // 
  // This also means that we'd need some way for users to 'adjust' their balances. Hmmeth Hmmeth
  // I don't want to trade UX for actual financial accuracy so I need a way that is still
  // accounting strong.
  // 
  // Purely UI, the place that shows the transactions is misleading. Account-wise, it's
  // correct. But for the person looking, the colours should be the other way around.
  // 
  // I'm having a rethink on the destinations and sources being multiple. Hmmeth hmmeth.
  // Does that truly work? I don't think so. Hmmeth hmmeth.
  // On giving loans, it does kinda work cause like someone can ask me for money and I go
  // I only have 5k in my account and I have another 3k in cash. That geniely does happen
  // on the loan side of things.
  // 
  // On the category summary and list transactions, the summary and load reset 
  // is wrong. I've caught the bug, the account that carries the category_id is the expense
  // account not the Cash, bank or whatever that we're checking on
  // const total = await this.prisma.journalEntry.aggregate({
  //   where: {
  //     category_id,
  //     transaction_date: { gte: start_date, lte: end_date },
  //     account: { 
  //     	user_id: user.id,
  //      	...(account_id && { id: account_id })
  //     },
  //   },
  //   _sum: { amount: true },
  // });
  // what's the fix
  // 
  // I dunno if it already exists but it's something subtl I realized
  // I can repay or recieve payment for a loan before the day the loan was given
  // I'm guessing this should be like the over spend one too where we check if the transaction_date
  // is before the loan and then show a warning that can be bypassed
  // 
  // The sibling repayments also return that exact repayment that was passed. Should we
  // allow it?
  // 
  // Did something now, user was registered August 24
  // I recieved repayment for a loan that is dated 26th
  // Okay, it's not a bug. The get_balances hardcodes the date to be now
  // so it won't see the ones after it
  // 
  // When someone sets a start date and end date, it's only normal that the list
  // starts from the start date and you scroll down to the end date.



  // on the part where we get summary, we gotta make it such that
  // we don't need to always pass in the start date and end date
  // if it don't exist it should just auto-magically get for all time.

  
  fastify.get("/seed", seed);

  fastify.post("/auth/login", login);
  fastify.post("/auth/logout", logout);
  fastify.post("/auth/refresh", refresh);
  fastify.post("/auth/register", register_user);

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
  
  fastify.get("/accounts/summary", get_account_summary);
  fastify.get("/accounts/transactions", list_transactions);

  fastify.get("/loans", list_loans);
  fastify.get("/loans/summary", get_loans_summary);
  fastify.get("/loans/:loan_id", get_loan);
  fastify.get("/loan-repayments/:repayment_id", get_loan_repayment);

  fastify.get("/counterparties/:counterparty_id/loans", get_counterparty_loans);
  fastify.get("/categories/:category_id/summary", get_category_summary);
  fastify.get("/categories/:category_id/transactions", list_category_transactions);
}

export default routes