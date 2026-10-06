export class Money {
	/** Splits a backend amount string ("12500.5") into display parts, without float math. */
	static splitAmount(amount: string): { whole: string; decimal: string } {
	  const [raw_whole = "0", raw_decimal = ""] = amount.split(".");
	  const negative = raw_whole.startsWith("-");
	  const digits = negative ? raw_whole.slice(1) : raw_whole;
	  const whole = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	  return {
	    whole: (negative ? "-" : "") + whole,
	    decimal: raw_decimal.padEnd(2, "0"),
	  };
	}
	
	static formatAmount(amount: string, currency_symbol: string): string {
	  const { whole, decimal } = this.splitAmount(amount);
	  return `${currency_symbol}${whole}.${decimal}`;
	}
	
	static exceedsLimit(total: string, limit: number): boolean {
  	return Number(total) > limit;
	}
	
	static entriesLabel(count: number): string {
  	return `${count} ${count === 1 ? "entry" : "entries"}`;
	}

	static sumAmounts(amounts: string[]): string {
	  const cents = amounts.reduce((acc, a) => {
	    const [w = "0", d = ""] = a.split(".");
	    return acc + BigInt(w) * 100n + BigInt(d.padEnd(2, "0").slice(0, 2));
	  }, 0n);
	  const s = cents.toString().padStart(3, "0");
	  return `${s.slice(0, -2)}.${s.slice(-2)}`;
	}
}