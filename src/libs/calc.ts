class Calc {
	static toWholeNumber(n: number) { return Math.round(n * 100); }
  static toDecimalNumber(n: number) { return n / 100; }
}

export default Calc;