import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import Balances from "#/libs/balances.js";
import Calc from "#/libs/calc.js";

async function handler(
	this: FastifyInstance,
	request: FastifyRequest,
	reply: FastifyReply
) {
  const user = await request.requireAuth();

  const asset_accounts = user.accounts.filter((a) => a.type === 'ASSET' && a.system_role === null);

  const now = new Date();

  const balances = await Promise.all(
    asset_accounts.map(async (account) => ({
      account_id: account.id,
      name: account.name,
      balance: await Balances.getBalanceAtDate(this.prisma, account.id, account.type, now),
    }))
  );

  const net_total_whole = balances.reduce((sum, a) => sum + Calc.toWholeNumber(a.balance), 0);
  const net_total = Calc.toDecimalNumber(net_total_whole);
  
  return reply.code(200).send({ balances, net_total });
}

// the money in and money out calculation on all accounts is wrong -- on ALL ACCOUNTS
// it adds up transfers too.
// 
// let's not make the dates default to today, it must always be opt-in
// and in the date pickers, it should show the full month
// 
// the amount field should show a comma
// 
// let's make transfer be blue instead of red.
//
// under the counterparty selector, if there's no person there
// make it so that the space doesn't show and it's just the button to 
// add new person that shows
// 
// we need a different icon for receive repayment. if we can get the opposite of the current
// icon it'd be nice.
// 
// we don't got a suitable icon for recieving loans though.
//
// I just might get rid of the split payments. Record them separately
// That way we always have 1:1 mappings of things.
// 
// Add in warnings for backdated stuff.
// 
//  We're about to implement errors into our work. You are only permitted to write into the twoside-ui
  // directory and that is also where your CLAUDE.md lives. In the UI, look into the
  // @twoside-ui/src/components/shared/errortoast.tsx for the way the warning messages look like. Then
  // look into the @twoside-ui/src/components/transactions/forms/ExpenseForm.tsx for how it was used. (It
  // is currently always on because I was testing how the UI element would look). Now, when the user
  // clicks the save expense button, it makes a call to the backend and the handler is at
  // @src/routes/logs/log-expense.ts (you can read the @src/libs/transaction-schemas.ts and
  // @src/errors/APIError.ts to get a better understanding of how the errors work). Notice now that there
  // are some errors that are hard errors e.g the error of expenses only being paid out of asset
  // accounts -- those aren't in scope for now because as long as the UI works properly, errors like
  // those should NEVER be thrown. What we will be focusing on instead is the bypass_warnings. As you can
  // see, somewarnings are softer. Made to show the user that they're probably doing the wrong thing but
  // it still allows them to do hit bypass. Your goal is to implement this warning feature across all
  // the transaction forms. Let it be that when the API returns the 409 and the type of warning, the UI
  // displays the warning message to the user and the button below becomes bypass warnings & save (or
  // whatever verb was there before) [you can find better labels for the buttons though, use your
  // discretion]. Also note that the bypass warnings is an array. In my next coding session I will add in
 // other warnings that can be thrown and the code will only throw one error at a time so even if there
 // were 4 warnings, the user would only see one, choose to continue, see the next one, choose to
 // continue and so on. Also, make it that when the error is shown, there is an X button they can use to
 // clear it (OR when they click on it or click on any other field the error disappears -- like how
 // normal UI behaves).
  
export const get_balances = { handler };