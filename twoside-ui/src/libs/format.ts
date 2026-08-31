class Format {
	static toNumber(value: number | string | null | undefined): number {
	  if (value === null || value === undefined) return 0;
	  return typeof value === "number" ? value : parseFloat(value);
	}
	
	static formatDate(date_str: string) {
	  const date = new Date(date_str);
	  if (isNaN(date.getTime())) return date_str;
	  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
	}
	
	static formatMoney(amount: number | string) {
	  return this.toNumber(amount).toLocaleString("en-NG", {
	    minimumFractionDigits: 2,
	    maximumFractionDigits: 2,
	  });
	}

	static todayDateStr() {
  	return new Date().toISOString().slice(0, 10);
	}
	
	static toISODateTime(date_str: string) {
  	return `${date_str}T00:00:00Z`;
	}
}

export default Format;