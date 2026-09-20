import { Prisma, PrismaClient } from "#/prisma/client.js";

class User {
  static async create(prisma: PrismaClient, email: string) {
    const balance_snapshots = {
      create: [{ balance: 0, as_of_date: new Date() }],
    };

    try {
      return await prisma.user.create({
        data: {
          email,
          categories: {
            create: [{ name: "Charges", lowercase_name: "charges", is_charge: true }],
          },
          accounts: {
            create: [
              { name: "Cash", type: "ASSET", system_role: null, balance_snapshots },
              { name: "Bank", type: "ASSET", system_role: null, balance_snapshots },
              { name: "Savings", type: "ASSET", system_role: null, balance_snapshots },
              { name: "Equity", type: "EQUITY", system_role: "EQUITY", balance_snapshots },
              { name: "Income", type: "INCOME", system_role: "INCOME", balance_snapshots },
              { name: "Expense", type: "EXPENSE", system_role: "EXPENSE", balance_snapshots },
              { name: "Payables", type: "LIABILITY", system_role: "PAYABLES", balance_snapshots },
              { name: "Recieveables", type: "ASSET", system_role: "RECEIVABLES", balance_snapshots },
            ],
          },
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return null; // caller decides what "already exists" means in context
      }
      throw err;
    }
  }
}

export default User;