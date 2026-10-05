class Money {
	static parse(value: string): number {
		const n = parseFloat(value);
		return Number.isFinite(n) ? n : 0;
	}

	static sum(values: number[]): number {
		const cents = values.reduce((acc, n) => acc + Math.round(n * 100), 0);
		return cents / 100;
	}
}

export default Money;