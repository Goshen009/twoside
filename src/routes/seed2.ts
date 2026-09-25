import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

async function handler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = await request.requireAuth();

  const accounts = user.accounts.filter(
    (a) => a.system_role === null && a.is_active
  );

  const find_account = (name: string) => {
    const account = accounts.find(
      (a) => a.name.toLowerCase() === name.toLowerCase()
    );

    if (!account) {
      throw new Error(`Required account "${name}" not found`);
    }

    return account;
  };

  const cash = find_account("Cash");
  const bank = find_account("Bank");
  const savings = find_account("Savings");

  /*
   * We deliberately call the existing HTTP endpoints instead of
   * duplicating their business logic here.
   *
   * This is a seed/test endpoint, so quick-and-dirty is fine.
   */
  const authorization = request.headers.authorization;

  if (!authorization) {
    return reply.code(401).send({
      message: "Authorization header required",
    });
  }

  const origin = `http://127.0.0.1:8080`;

  async function api(
    method: string,
    path: string,
    body?: unknown
  ) {
    const response = await fetch(`${origin}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization!,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const json = await response.json().catch(() => ({}));

    return {
      status: response.status,
      json,
    };
  }

  async function info() {
    const result = await api("GET", "/info");

    if (result.status !== 200) {
      throw new Error(
        `GET /info failed: ${result.status} ${JSON.stringify(result.json)}`
      );
    }

    return result.json as {
      open_loans: {
        id: string;
        amount: number;
        status: string;
        direction: "GIVEN" | "BORROWED";
        counterparty_name: string;
        total_repaid: number;
      }[];
    };
  }

  async function find_loan(
    counterparty_name: string,
    direction: "GIVEN" | "BORROWED",
    amount: number
  ) {
    const result = await info();

    const loan = result.open_loans.find(
      (loan) =>
        loan.counterparty_name === counterparty_name &&
        loan.direction === direction &&
        Math.abs(loan.amount - amount) < 0.005
    );

    if (!loan) {
      throw new Error(
        `Could not find ${direction} loan for ${counterparty_name} (${amount})`
      );
    }

    return loan.id;
  }

  const dt = (day: number) =>
    `2026-08-${String(day).padStart(2, "0")}T09:00:00Z`;

  const steps: {
    description: string;
    method: string;
    path: string;
    body?: unknown;
  }[] = [];

  // ─────────────────────────────────────────────────────────────
  // 01–24 — original test-suite scenarios
  // ─────────────────────────────────────────────────────────────

  steps.push(
    {
      description: "01. Tunde salary → Bank",
      method: "POST",
      path: "/log/income",
      body: {
        description: "01. August salary",
        transaction_date: dt(1),
        destinations: [
          { account_id: bank.id, amount: 100000, charge: 0 },
        ],
      },
    },

    {
      description: "02. Subscription expense → Bank",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "02. Monthly subscriptions",
        transaction_date: dt(1),
        category_name: "Subscriptions",
        sources: [
          { account_id: bank.id, amount: 15000, charge: 10 },
        ],
        bypass_warnings: [],
      },
    },

    {
      description: "03. Bank → Savings",
      method: "POST",
      path: "/log/transfer",
      body: {
        description: "03. Moving to savings",
        transaction_date: dt(2),
        amount: 20000,
        charge: 0,
        from_account_id: bank.id,
        to_account_id: savings.id,
        bypass_warnings: [],
      },
    },

    {
      description: "04. Bank → Cash with charge",
      method: "POST",
      path: "/log/transfer",
      body: {
        description: "04. ATM withdrawal",
        transaction_date: dt(3),
        amount: 5000,
        charge: 25.5,
        from_account_id: bank.id,
        to_account_id: cash.id,
        bypass_warnings: [],
      },
    },

    {
      description: "05. Groceries → Cash",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "05. Weekly groceries",
        transaction_date: dt(4),
        category_name: "Groceries",
        sources: [
          { account_id: cash.id, amount: 3500, charge: 0 },
        ],
        bypass_warnings: [],
      },
    },

    {
      description: "06. Side gig → Cash",
      method: "POST",
      path: "/log/income",
      body: {
        description: "06. Side gig payment",
        transaction_date: dt(4),
        destinations: [
          { account_id: cash.id, amount: 2500, charge: 0 },
        ],
      },
    },

    {
      description: "07. Transport → Cash",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "07. Transport",
        transaction_date: dt(6),
        category_name: null,
        sources: [
          { account_id: cash.id, amount: 1000, charge: 0 },
        ],
        bypass_warnings: [],
      },
    },

    {
      description: "08. Rent split Bank + Savings",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "08. Monthly rent",
        transaction_date: dt(5),
        category_name: "Rent",
        sources: [
          { account_id: bank.id, amount: 30000, charge: 15 },
          { account_id: savings.id, amount: 15000, charge: 0 },
        ],
        bypass_warnings: [],
      },
    },

    {
      description: "09. Lend Ade from Bank",
      method: "POST",
      path: "/log/loan",
      body: {
        description: "09. Lent to Ade",
        transaction_date: dt(7),
        counterparty_name: "Ade",
        sources: [
          { account_id: bank.id, amount: 10000, charge: 0 },
        ],
        bypass_warnings: [],
      },
    },

    {
      description: "10. Lend Chioma split Cash + Savings",
      method: "POST",
      path: "/log/loan",
      body: {
        description: "10. Lent to Chioma",
        transaction_date: dt(8),
        counterparty_name: "Chioma",
        sources: [
          { account_id: cash.id, amount: 2000, charge: 0.5 },
          { account_id: savings.id, amount: 3000, charge: 0.5 },
        ],
        bypass_warnings: [],
      },
    },

    {
      description: "11. Borrow from Emeka → Bank",
      method: "POST",
      path: "/log/borrow",
      body: {
        description: "11. Borrowed from Emeka",
        transaction_date: dt(9),
        counterparty_name: "Emeka",
        destinations: [
          { account_id: bank.id, amount: 20000, charge: 0 },
        ],
      },
    },

    {
      description: "12. Borrow from Ade → Savings",
      method: "POST",
      path: "/log/borrow",
      body: {
        description: "12. Borrowed from Ade",
        transaction_date: dt(10),
        counterparty_name: "Ade",
        destinations: [
          { account_id: savings.id, amount: 8000, charge: 12.5 },
        ],
      },
    },

    {
      description: "13. Partial repayment → Emeka",
      method: "POST",
      path: "/log/loan-repayed",
      body: async () => ({
        description: "13. Partial repayment to Emeka",
        transaction_date: dt(11),
        loan_id: await find_loan("Emeka", "BORROWED", 20000),
        sources: [
          { account_id: bank.id, amount: 10000, charge: 0 },
        ],
        bypass_warnings: [],
      }),
    } as any,

    {
      description: "14. Final repayment → Emeka",
      method: "POST",
      path: "/log/loan-repayed",
      body: async () => ({
        description: "14. Final repayment to Emeka",
        transaction_date: dt(12),
        loan_id: await find_loan("Emeka", "BORROWED", 20000),
        sources: [
          { account_id: bank.id, amount: 10000, charge: 5 },
        ],
        bypass_warnings: [],
      }),
    } as any,

    {
      description: "15. Ade partial repayment",
      method: "POST",
      path: "/log/borrow-returned",
      body: async () => ({
        description: "15. Ade partial repayment",
        transaction_date: dt(13),
        loan_id: await find_loan("Ade", "GIVEN", 10000),
        destinations: [
          { account_id: cash.id, amount: 4000, charge: 0 },
        ],
        bypass_warnings: [],
      }),
    } as any,

    {
      description: "16. Ade final repayment",
      method: "POST",
      path: "/log/borrow-returned",
      body: async () => ({
        description: "16. Ade final repayment",
        transaction_date: dt(14),
        loan_id: await find_loan("Ade", "GIVEN", 10000),
        destinations: [
          { account_id: bank.id, amount: 6000, charge: 8.5 },
        ],
        bypass_warnings: [],
      }),
    } as any,

    {
      description: "17. Insufficient balance warning",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "17. Big purchase",
        transaction_date: dt(15),
        category_name: "Groceries",
        sources: [
          { account_id: cash.id, amount: 50000, charge: 0 },
        ],
        bypass_warnings: [],
      },
    },

    {
      description: "18. Insufficient balance bypassed",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "18. Big purchase bypassed",
        transaction_date: dt(15),
        category_name: "Groceries",
        sources: [
          { account_id: cash.id, amount: 50000, charge: 0 },
        ],
        bypass_warnings: ["INSUFFICIENT_BALANCE"],
      },
    },

    {
      description: "19. Restore Cash",
      method: "POST",
      path: "/log/income",
      body: {
        description: "19. Emergency top-up",
        transaction_date: dt(15),
        destinations: [
          { account_id: cash.id, amount: 50000, charge: 0 },
        ],
      },
    },

    {
      description: "20. Repayment dated before loan",
      method: "POST",
      path: "/log/loan-repayed",
      body: async () => ({
        description: "20. Early repayment attempt",
        transaction_date: dt(1),
        loan_id: await find_loan("Ade", "BORROWED", 8000),
        sources: [
          { account_id: savings.id, amount: 100, charge: 0 },
        ],
        bypass_warnings: [],
      }),
    } as any,

    {
      description: "21. Repayment dated before loan bypassed",
      method: "POST",
      path: "/log/loan-repayed",
      body: async () => ({
        description: "21. Early repayment bypassed",
        transaction_date: dt(1),
        loan_id: await find_loan("Ade", "BORROWED", 8000),
        sources: [
          { account_id: savings.id, amount: 100, charge: 0 },
        ],
        bypass_warnings: ["REPAYMENT_DATED_BEFORE"],
      }),
    } as any,

    {
      description: "22. Duplicate account validation",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "22. Duplicate account test",
        transaction_date: dt(17),
        category_name: "Groceries",
        sources: [
          { account_id: cash.id, amount: 100, charge: 0 },
          { account_id: cash.id, amount: 50, charge: 0 },
        ],
        bypass_warnings: [],
      },
    },

    {
      description: "23. Same-account transfer validation",
      method: "POST",
      path: "/log/transfer",
      body: {
        description: "23. Same account transfer",
        transaction_date: dt(17),
        amount: 100,
        charge: 0,
        from_account_id: cash.id,
        to_account_id: cash.id,
        bypass_warnings: [],
      },
    },

    {
      description: "24. Zero-income validation",
      method: "POST",
      path: "/log/income",
      body: {
        description: "24. Zero income",
        transaction_date: dt(17),
        destinations: [
          { account_id: cash.id, amount: 0, charge: 0 },
        ],
      },
    }
  );

  // ─────────────────────────────────────────────────────────────
  // 25–55 — additional dummy data
  // ─────────────────────────────────────────────────────────────

  steps.push(
    {
      description: "25. Freelance payment → Bank",
      method: "POST",
      path: "/log/income",
      body: {
        description: "25. Freelance payment",
        transaction_date: dt(18),
        destinations: [{ account_id: bank.id, amount: 45000, charge: 0 }],
      },
    },
    {
      description: "26. Food expense → Cash",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "26. Lunch",
        transaction_date: dt(18),
        category_name: "Food",
        sources: [{ account_id: cash.id, amount: 2500, charge: 0 }],
        bypass_warnings: [],
      },
    },
    {
      description: "27. Bank → Savings",
      method: "POST",
      path: "/log/transfer",
      body: {
        description: "27. Savings deposit",
        transaction_date: dt(19),
        amount: 10000,
        charge: 0,
        from_account_id: bank.id,
        to_account_id: savings.id,
        bypass_warnings: [],
      },
    },
    {
      description: "28. Transport expense → Cash",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "28. Transport",
        transaction_date: dt(19),
        category_name: "Transport",
        sources: [{ account_id: cash.id, amount: 1800, charge: 0 }],
        bypass_warnings: [],
      },
    },
    {
      description: "29. Business income → Bank",
      method: "POST",
      path: "/log/income",
      body: {
        description: "29. Business income",
        transaction_date: dt(20),
        destinations: [{ account_id: bank.id, amount: 75000, charge: 0 }],
      },
    },
    {
      description: "30. Electricity expense → Bank",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "30. Electricity bill",
        transaction_date: dt(20),
        category_name: "Utilities",
        sources: [{ account_id: bank.id, amount: 12000, charge: 25 }],
        bypass_warnings: [],
      },
    },
    {
      description: "31. Bank → Cash",
      method: "POST",
      path: "/log/transfer",
      body: {
        description: "31. Cash withdrawal",
        transaction_date: dt(21),
        amount: 15000,
        charge: 50,
        from_account_id: bank.id,
        to_account_id: cash.id,
        bypass_warnings: [],
      },
    },
    {
      description: "32. Shopping expense → Cash",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "32. Shopping",
        transaction_date: dt(21),
        category_name: "Shopping",
        sources: [{ account_id: cash.id, amount: 7000, charge: 0 }],
        bypass_warnings: [],
      },
    },
    {
      description: "33. Contract payment → Bank",
      method: "POST",
      path: "/log/income",
      body: {
        description: "33. Contract payment",
        transaction_date: dt(22),
        destinations: [{ account_id: bank.id, amount: 120000, charge: 100 }],
      },
    },
    {
      description: "34. Internet expense → Bank",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "34. Internet subscription",
        transaction_date: dt(22),
        category_name: "Utilities",
        sources: [{ account_id: bank.id, amount: 8000, charge: 0 }],
        bypass_warnings: [],
      },
    },
    {
      description: "35. Bank → Savings",
      method: "POST",
      path: "/log/transfer",
      body: {
        description: "35. Savings transfer",
        transaction_date: dt(23),
        amount: 25000,
        charge: 0,
        from_account_id: bank.id,
        to_account_id: savings.id,
        bypass_warnings: [],
      },
    },
    {
      description: "36. Fuel expense → Cash",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "36. Fuel",
        transaction_date: dt(23),
        category_name: "Transport",
        sources: [{ account_id: cash.id, amount: 6000, charge: 0 }],
        bypass_warnings: [],
      },
    },
    {
      description: "37. Gift income → Bank",
      method: "POST",
      path: "/log/income",
      body: {
        description: "37. Gift received",
        transaction_date: dt(24),
        destinations: [{ account_id: bank.id, amount: 20000, charge: 0 }],
      },
    },
    {
      description: "38. Restaurant expense → Cash",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "38. Restaurant",
        transaction_date: dt(24),
        category_name: "Food",
        sources: [{ account_id: cash.id, amount: 4500, charge: 0 }],
        bypass_warnings: [],
      },
    },
    {
      description: "39. Bank → Cash",
      method: "POST",
      path: "/log/transfer",
      body: {
        description: "39. ATM withdrawal",
        transaction_date: dt(25),
        amount: 10000,
        charge: 25,
        from_account_id: bank.id,
        to_account_id: cash.id,
        bypass_warnings: [],
      },
    },
    {
      description: "40. Household expense → Cash",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "40. Household supplies",
        transaction_date: dt(25),
        category_name: "Household",
        sources: [{ account_id: cash.id, amount: 5500, charge: 0 }],
        bypass_warnings: [],
      },
    },
    {
      description: "41. Salary bonus → Bank",
      method: "POST",
      path: "/log/income",
      body: {
        description: "41. Salary bonus",
        transaction_date: dt(26),
        destinations: [{ account_id: bank.id, amount: 30000, charge: 0 }],
      },
    },
    {
      description: "42. Medical expense → Bank",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "42. Medical expense",
        transaction_date: dt(26),
        category_name: "Health",
        sources: [{ account_id: bank.id, amount: 9500, charge: 0 }],
        bypass_warnings: [],
      },
    },
    {
      description: "43. Bank → Savings",
      method: "POST",
      path: "/log/transfer",
      body: {
        description: "43. Savings deposit",
        transaction_date: dt(27),
        amount: 15000,
        charge: 0,
        from_account_id: bank.id,
        to_account_id: savings.id,
        bypass_warnings: [],
      },
    },
    {
      description: "44. Data expense → Cash",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "44. Mobile data",
        transaction_date: dt(27),
        category_name: "Utilities",
        sources: [{ account_id: cash.id, amount: 3500, charge: 0 }],
        bypass_warnings: [],
      },
    },
    {
      description: "45. Refund income → Bank",
      method: "POST",
      path: "/log/income",
      body: {
        description: "45. Refund received",
        transaction_date: dt(28),
        destinations: [{ account_id: bank.id, amount: 8500, charge: 0 }],
      },
    },
    {
      description: "46. Clothing expense → Cash",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "46. Clothing",
        transaction_date: dt(28),
        category_name: "Shopping",
        sources: [{ account_id: cash.id, amount: 9000, charge: 0 }],
        bypass_warnings: [],
      },
    },
    {
      description: "47. Bank → Cash",
      method: "POST",
      path: "/log/transfer",
      body: {
        description: "47. Cash withdrawal",
        transaction_date: dt(29),
        amount: 20000,
        charge: 30,
        from_account_id: bank.id,
        to_account_id: cash.id,
        bypass_warnings: [],
      },
    },
    {
      description: "48. Groceries → Cash",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "48. Groceries",
        transaction_date: dt(29),
        category_name: "Groceries",
        sources: [{ account_id: cash.id, amount: 6500, charge: 0 }],
        bypass_warnings: [],
      },
    },
    {
      description: "49. Consulting income → Bank",
      method: "POST",
      path: "/log/income",
      body: {
        description: "49. Consulting income",
        transaction_date: dt(30),
        destinations: [{ account_id: bank.id, amount: 90000, charge: 0 }],
      },
    },
    {
      description: "50. Rent expense → Bank",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "50. Rent payment",
        transaction_date: dt(30),
        category_name: "Rent",
        sources: [{ account_id: bank.id, amount: 45000, charge: 15 }],
        bypass_warnings: [],
      },
    },
    {
      description: "51. Bank → Savings",
      method: "POST",
      path: "/log/transfer",
      body: {
        description: "51. End of month savings",
        transaction_date: dt(31),
        amount: 20000,
        charge: 0,
        from_account_id: bank.id,
        to_account_id: savings.id,
        bypass_warnings: [],
      },
    },
    {
      description: "52. Entertainment expense → Cash",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "52. Entertainment",
        transaction_date: dt(31),
        category_name: "Entertainment",
        sources: [{ account_id: cash.id, amount: 5000, charge: 0 }],
        bypass_warnings: [],
      },
    },
    {
      description: "53. Final month income → Bank",
      method: "POST",
      path: "/log/income",
      body: {
        description: "53. Final month income",
        transaction_date: dt(31),
        destinations: [{ account_id: bank.id, amount: 50000, charge: 0 }],
      },
    },
    {
      description: "54. Final groceries → Cash",
      method: "POST",
      path: "/log/expense",
      body: {
        description: "54. Final groceries",
        transaction_date: dt(31),
        category_name: "Groceries",
        sources: [{ account_id: cash.id, amount: 4000, charge: 0 }],
        bypass_warnings: [],
      },
    },
    {
      description: "55. Final savings transfer",
      method: "POST",
      path: "/log/transfer",
      body: {
        description: "55. Final savings transfer",
        transaction_date: dt(31),
        amount: 10000,
        charge: 0,
        from_account_id: bank.id,
        to_account_id: savings.id,
        bypass_warnings: [],
      },
    }
  );

  // ─────────────────────────────────────────────────────────────
  // Run everything sequentially
  // ─────────────────────────────────────────────────────────────

  const results: {
    number: number;
    description: string;
    status: number;
    ok: boolean;
    response: unknown;
  }[] = [];

  for (const [index, step] of steps.entries()) {
    try {
      let body = step.body;

      // Some steps need a loan ID that only exists after
      // an earlier request has completed.
      if (typeof body === "function") {
        body = await body();
      }

      const result = await api(step.method, step.path, body);

      results.push({
        number: index + 1,
        description: step.description,
        status: result.status,
        ok: result.status >= 200 && result.status < 300,
        response: result.json,
      });
    } catch (error) {
      results.push({
        number: index + 1,
        description: step.description,
        status: 0,
        ok: false,
        response: {
          error: error instanceof Error
            ? error.message
            : String(error),
        },
      });
    }
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.length - passed;

  return reply.code(failed === 0 ? 200 : 207).send({
    message: `Seed completed: ${passed}/${results.length} succeeded`,
    accounts: {
      cash: cash.id,
      bank: bank.id,
      savings: savings.id,
    },
    total: results.length,
    passed,
    failed,
    results,
  });
}

export const seed2 = { handler };