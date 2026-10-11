export type Span = { raw: string; start: number; end: number };
export type Candidate = Span & { amount: number };

export type AmountResult =
	| { status: "matched"; amount: number; span: Span }
	| { status: "ambiguous"; amount: number; span: Span; others: Candidate[] }
	| { status: "unsure"; raw: string }
	| { status: "none" };

class AmountParser {
	// loose: grabs whatever follows a symbol
	private static SYMBOL_TOKEN = /(?<![A-Za-z0-9])[#$£₦]\s*([A-Za-z0-9.,]+)/g;
	// strict: decides if that token is a real amount
	private static STRICT = /^(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?(?:([kmh])(\d+)?)?$/i;
	// bare numbers with no symbol (no "h" allowed here, so "2h" stays hours)
	private static BARE = /(?<![A-Za-z0-9.])(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?[kKmM]?(?![A-Za-z0-9])/g;
	private static MULT = { k: 1_000, m: 1_000_000, h: 100 } as const;

	private static normalize(token: string): number | null {
		const m = AmountParser.STRICT.exec(token);
		if (!m) return null;
		const [, whole, dec, suffix, after] = m;
		if (dec && after) return null; // "12.5k3" makes no sense
		const base = Number(`${whole!.replaceAll(",", "")}.${dec ?? after ?? "0"}`);
		if (!suffix) return base;
		return Math.round(base * AmountParser.MULT[suffix.toLowerCase() as "k" | "m" | "h"]);
	}

	private static pick(cands: Candidate[]): AmountResult {
		if (!cands.length) return { status: "none" };
		const picked = cands[cands.length - 1]!; // last one wins
		const others = cands.slice(0, -1)!;
		return others.length
			? { status: "ambiguous", amount: picked.amount, span: picked, others }
			: { status: "matched", amount: picked.amount, span: picked };
	}

	private static symbolLevel(text: string): AmountResult {
		const valid: Candidate[] = [];
		const invalid: Span[] = [];

		for (const m of text.matchAll(AmountParser.SYMBOL_TOKEN)) {
			const token = m[1]!.replace(/[.,]+$/, ""); // "$12." at the end of a sentence
			const start = m.index! + m[0].indexOf(m[1]!);
			const span = { raw: token, start, end: start + token.length };
			const amount = AmountParser.normalize(token);
			if (amount === null) invalid.push(span);
			else valid.push({ ...span, amount });
		}

		if (!valid.length && !invalid.length) return { status: "none" };
		if (!valid.length) return { status: "unsure", raw: invalid[invalid.length - 1]!.raw };

		const result = AmountParser.pick(valid);
		// a bad token next to a good one: still flag it
		if (invalid.length && result.status === "matched") {
			return { status: "ambiguous", amount: result.amount, span: result.span, others: [] };
		}
		return result;
	}

	private static bareCandidates(text: string): Candidate[] {
		const out: Candidate[] = [];
		for (const m of text.matchAll(AmountParser.BARE)) {
			const amount = AmountParser.normalize(m[0]);
			if (amount === null) continue;
			out.push({ raw: m[0], start: m.index!, end: m.index! + m[0].length, amount });
		}
		return out;
	}

	private static kmLevel(text: string): AmountResult {
		return AmountParser.pick(AmountParser.bareCandidates(text).filter((c) => /[kKmM]$/.test(c.raw)));
	}

	private static plainLevel(text: string): AmountResult {
		return AmountParser.pick(AmountParser.bareCandidates(text));
	}

	static parse(text: string): AmountResult {
		const levels = [
			AmountParser.symbolLevel,
			AmountParser.kmLevel,
			AmountParser.plainLevel,
		];
		for (const level of levels) {
			const result = level(text);
			if (result.status !== "none") return result;
		}
		return { status: "none" };
	}
}

export default AmountParser;