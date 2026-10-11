import { DateTime } from "luxon";
import AmountParser, { type AmountResult } from "./AmountParser.js";
import TagParser, { type Tag, type TagResult } from "./TagParser.js";

export type ParsedLine = {
	index: number;
	raw: string;
	amount: AmountResult;
	tag: TagResult;
	date: string; // YYYY-MM-DD
	description: string;
	warnings: string[];
	errors: string[];
};

type Ctx = { tags: Tag[]; timezone: string };

class LineParser {
	private static FILLER = new Set([
		"for", "on", "at", "of", "to", "the", "a", "an", "with", "and", "via", "using",
	]);
	private static DATE_WORD = /^\s*(today|yesterday)\b|\b(today|yesterday)(?=\s*$)/i;

	private static clean(line: string): string {
		return line
			.replace(/[\u00A0\u202F]/g, " ")
			.replace(/[\u200B-\u200D\uFEFF]/g, "")
			.replace(/[\u2018\u2019]/g, "'")
			.replace(/[\u201C\u201D]/g, '"')
			.trim();
	}

	private static mask(s: string, start: number, end: number): string {
		return s.slice(0, start) + " ".repeat(end - start) + s.slice(end);
	}

	private static description(masked: string): string {
		const words = masked.replace(/[#$£₦@]/g, " ").split(/\s+/).filter(Boolean);
		while (words.length && LineParser.FILLER.has(words[0]!.toLowerCase())) words.shift();
		while (words.length && LineParser.FILLER.has(words[words.length - 1]!.toLowerCase())) words.pop();
		return words.join(" ");
	}

	static parse(line: string, index: number, ctx: Ctx): ParsedLine {
		const warnings: string[] = [];
		const errors: string[] = [];
		let work = LineParser.clean(line);

		if (work.length > 200) errors.push("line is longer than 200 characters");

		// 1. tag
		const t = TagParser.extract(work, ctx.tags);
		work = t.text;
		warnings.push(...t.warnings);
		errors.push(...t.errors);

		// 2. date word (overrides the batch date for this line)
		const now = DateTime.now().setZone(ctx.timezone);
		let date = now.toISODate()!;
		const dm = LineParser.DATE_WORD.exec(work);
		if (dm) {
			const word = (dm[1] ?? dm[2]!).toLowerCase();
			if (word === "yesterday") date = now.minus({ days: 1 }).toISODate()!;
			work = LineParser.mask(work, dm.index, dm.index + dm[0].length);
		}

		// 3. amount
		const amount = AmountParser.parse(work);
		if (amount.status === "none") errors.push("no amount");
		if (amount.status === "unsure") warnings.push(`couldn't read "${amount.raw}"`);
		if (amount.status === "matched" || amount.status === "ambiguous") {
			if (amount.amount <= 0 || amount.amount > 1_000_000_000) errors.push("amount out of range");
			work = LineParser.mask(work, amount.span.start, amount.span.end);
		}

		// 4. description
		let description = LineParser.description(work);
		if (!description) {
			description =
				t.tag.kind === "existing" || t.tag.kind === "near" ? t.tag.tag.name
				: t.tag.kind === "new" ? t.tag.name
				: "Expense";
		}
		if (description.length > 120) {
			description = description.slice(0, 120);
			warnings.push("description truncated to 120 characters");
		}

		return { index, raw: line, amount, tag: t.tag, date, description, warnings, errors };
	}
}

export default LineParser;