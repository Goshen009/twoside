export default class Format {
	static balance(balance: number, currency_symbol: string) {
		const [whole, decimal] = balance.toFixed(2).split(".");
		const with_separators = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return { 
			whole: `${currency_symbol}${with_separators}`,
			decimal,
			full: `${currency_symbol}${with_separators}${decimal}`
		};
	}
}

