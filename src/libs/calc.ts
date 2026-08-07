import { AccountType, EntrySide, PrismaClient } from "#/prisma/client.js";

class Calc {
	static to_whole(n: number) { return Math.round(n * 100); }

	static resolve_delta(type: AccountType, side: EntrySide, amount: number): number {
		if (type === 'ASSET' || type === 'EXPENSE') {
	    if (side === 'DEBIT') return amount;
			else return -amount;
	  } else {
	    if (side === 'CREDIT') return amount;
			else return -amount;
	  }
	}

	static async get_account_balance_at_date(account_id: string, account_type: AccountType, target_date: Date, prisma: PrismaClient) {
		// finds the latest snapshot before the target_date
  	const latest_snapshot = await prisma.accountBalanceSnapshot.findFirst({
      where: { account_id, as_of_date: { lte: target_date } },
      orderBy: { as_of_date: 'desc' }
    });

   	// if we found a latest snapshot, use the date it was taken as the date to query for
    // the journal entries. If not, sets the date to 1970-01-01 (basically searches from the beginning)
  	const span_start = latest_snapshot ? latest_snapshot.as_of_date : new Date(0);

   	// now we get all the journals that weren't covered by the snapshot by picking
    // entries that came after the snapshot but before the time we want to see.
	  const gap_entries = await prisma.journalEntry.findMany({
		  where: { account_id, trx_date: { gt: span_start, lte: target_date } }
	  });

		// uses the same formula from when we create snapshots
    // we get the balance for this account by adding up all the amounts of all the transactions
    // of the entries within that gap
    const delta = gap_entries.reduce((sum, e) =>
        sum + Calc.resolve_delta(account_type, e.side, Calc.to_whole(Number(e.amount))), 0);

    // if we have the latest snapshot, we increment from that snapshots balance else from 0
    const balance = (latest_snapshot ? Calc.to_whole(Number(latest_snapshot.balance)) : 0) + delta;

    return (balance / 100);
	}

	// Given a category and a target date, returns the correct total_allocated
	// and total_spent AS OF that date — using the nearest snapshot plus only
	// the small gap since then, never scanning from genesis.
	static async get_budget_snapshot_totals(
	  category_id: string,
	  target_date: Date,
	  prisma: PrismaClient
	) {
	  // finds the latest budget snapshot at or before target_date
	  const latest_snapshot = await prisma.budgetSnapshot.findFirst({
	    where: { category_id, as_of_date: { lte: target_date } },
	    orderBy: { as_of_date: 'desc' }
	  });
		
	  // if found, only look at what happened AFTER that snapshot; else, from genesis
	  const span_start = latest_snapshot ? latest_snapshot.as_of_date : new Date(0);
	
	  const [gap_allocations, gap_expenses] = await Promise.all([
	    prisma.budgetAllocation.findMany({
	      where: { category_id, date_allocated: { gt: span_start, lte: target_date } }
	    }),
	    prisma.journalEntry.findMany({
	      where: {
	        category_id,
	        side: 'DEBIT',
	        account: { type: 'EXPENSE' },
	        trx_date: { gt: span_start, lte: target_date }
	      }
	    })
	  ]);
	
	  const allocated_delta = gap_allocations.reduce((sum, a) => sum + Calc.to_whole(Number(a.amount)), 0);
	  const spent_delta = gap_expenses.reduce((sum, e) => sum + Calc.to_whole(Number(e.amount)), 0);
		
	  const total_allocated = (latest_snapshot ? Calc.to_whole(Number(latest_snapshot.total_allocated)) : 0) + allocated_delta;
	  const total_spent = (latest_snapshot ? Calc.to_whole(Number(latest_snapshot.total_spent)) : 0) + spent_delta;
		
	  return {
	    total_allocated: total_allocated / 100,
	    total_spent: total_spent / 100
	  };
	}


	
	static async generate_weekly_snapshot(prisma: PrismaClient) {
		const as_of_date = new Date();

		const users = await prisma.user.findMany({
	    include: { accounts: true, categories: true }
	  });

		for (const user of users) {
			await prisma.$transaction(async (tx) => {
				// Account Balance Snapshots
				for (const account of user.accounts) {
					const latest = await tx.accountBalanceSnapshot.findFirst({
	          where: { account_id: account.id },
	          orderBy: { as_of_date: 'desc' }
	        });

					const entries = await tx.journalEntry.findMany({
	          where: {
	            account_id: account.id,
	            trx_date: latest ? { gt: latest.as_of_date, lte: as_of_date } : { lte: as_of_date }
	          }
	        });

					const delta = entries.reduce((sum, e) => {
	          const d = this.resolve_delta(account.type, e.side, this.to_whole(Number(e.amount)));
	          return sum + d;
	        }, 0);

					const new_balance = (latest ? this.to_whole(Number(latest.balance)) : 0) + delta;
					
	        await tx.accountBalanceSnapshot.create({
	          data: {
	            account_id: account.id,
	            as_of_date,
	            balance: new_balance / 100
	          }
	        });
				}

				// Budget Snapshots
				for (const category of user.categories) {
					const latest = await tx.budgetSnapshot.findFirst({
	          where: { category_id: category.id },
	          orderBy: { as_of_date: 'desc' }
	        });

					const allocations = await tx.budgetAllocation.findMany({
	          where: {
	            category_id: category.id,
	            date_allocated: latest ? { gt: latest.as_of_date, lte: as_of_date } : { lte: as_of_date }
	          }
	        });

					const expense_entries = await tx.journalEntry.findMany({
	          where: {
	            category_id: category.id,
	            side: 'DEBIT',
							account: { type: 'EXPENSE' },
	            trx_date: latest ? { gt: latest.as_of_date, lte: as_of_date } : { lte: as_of_date }
	          }
	        });

					const new_allocated = (latest ? this.to_whole(Number(latest.total_allocated)) : 0)
	          + allocations.reduce((sum, a) => sum + this.to_whole(Number(a.amount)), 0);
						
	        const new_spent = (latest ? this.to_whole(Number(latest.total_spent)) : 0)
						+ expense_entries.reduce((sum, e) => sum + this.to_whole(Number(e.amount)), 0);
						
	        await tx.budgetSnapshot.create({
	          data: {
	            category_id: category.id,
	            as_of_date,
	            total_allocated: new_allocated / 100,
	            total_spent: new_spent / 100
	          }
	        });
				}
			});
		}
	}
}

export default Calc;