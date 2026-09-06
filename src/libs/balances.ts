import { PrismaClient, AccountType, AccountingSide, Prisma } from "#/prisma/client.js";
import Calc from "./calc.js";

class Balances {
  static resolveDelta(type: AccountType, side: AccountingSide, amount: number): number {
  	if (type === AccountType.ASSET || type === AccountType.EXPENSE) {
      if (side === 'DEBIT') return amount;
      else return -amount;
    } else {
      if (side === 'CREDIT') return amount;
      else return -amount;
    }
  }

  // static async getBalanceAtDate(prisma: PrismaClient, account_id: string, account_type: AccountType, target_date: Date): Promise<number> {
  // 	// finds the latest snapshot before the target_date
  // 	const latest_snapshot = await prisma.accountBalanceSnapshot.findFirst({
  //     where: { account_id, as_of_date: { lte: target_date } },
  //     orderBy: { as_of_date: 'desc' },
  //   });

  // 	// if we found a latest snapshot, use the date it was taken as the date to query for
  //  	// the journal entries. If not, sets the date to 1970-01-01 (basically searches from the beginning)
  //  	const span_start = latest_snapshot ? latest_snapshot.as_of_date : new Date(0);

  //   // now we get all the journals that weren't covered by the snapshot by picking
  //   // entries that came after the snapshot but before the time we want to see.
  //   const gap_entries = await prisma.journalEntry.findMany({
  //     where: { account_id, transaction_date: { gt: span_start, lte: target_date } },
  //   });

  //   const delta = gap_entries.reduce((sum, e) => 
  //   	sum + this.resolveDelta(account_type, e.side, Calc.toWholeNumber(Number(e.amount))), 0);

  //   // if we have the latest snapshot, we increment from that snapshots balance else from 0
  //   const balance = (latest_snapshot ? Calc.toWholeNumber(Number(latest_snapshot.balance)) : 0) + delta;

  //   return Calc.toDecimalNumber(balance);
  // }

  static async getBalancesAtDate(prisma: PrismaClient | Prisma.TransactionClient, accounts: { id: string; type: AccountType }[], target_date: Date): Promise<Record<string, number>> {
    const account_ids = accounts.map(a => a.id);
  
    const latest_snapshots = await prisma.accountBalanceSnapshot.findMany({
      where: { account_id: { in: account_ids }, as_of_date: { lte: target_date } },
      orderBy: [{ account_id: 'asc' }, { as_of_date: 'desc' }],
      distinct: ['account_id'],
    });
    const snapshot_by_account = new Map(latest_snapshots.map(s => [s.account_id, s]));
  
    const span_start_by_account = new Map(
      accounts.map(a => [a.id, snapshot_by_account.get(a.id)?.as_of_date ?? new Date(0)])
    );
  
    const earliest_span_start = new Date(
      Math.min(...[...span_start_by_account.values()].map(d => d.getTime()))
    );
  
    const all_gap_entries = await prisma.journalEntry.findMany({
      where: { account_id: { in: account_ids }, transaction_date: { gt: earliest_span_start, lte: target_date } },
    });
  
    const result: Record<string, number> = {};
    for (const account of accounts) {
      const snapshot = snapshot_by_account.get(account.id);
      const span_start = snapshot ? snapshot.as_of_date : new Date(0);
    
      const delta = all_gap_entries
        .filter(e => e.account_id === account.id && e.transaction_date > span_start)
        .reduce((sum, e) => sum + this.resolveDelta(account.type, e.side, Calc.toWholeNumber(Number(e.amount))), 0);
    
      const balance = (snapshot ? Calc.toWholeNumber(Number(snapshot.balance)) : 0) + delta;
      result[account.id] = Calc.toDecimalNumber(balance);
    }

    return result;
  }
}

export default Balances;