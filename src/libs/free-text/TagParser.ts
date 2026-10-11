export type Tag = { id: string; name: string };

export type TagResult =
	| { kind: "none" }
	| { kind: "existing"; tag: Tag }
	| { kind: "near"; tag: Tag; typed: string } // auto-applied guess
	| { kind: "new"; name: string };

export type TagExtraction = {
	text: string; // the line with the tag blanked out
	tag: TagResult;
	warnings: string[];
	errors: string[];
};

class TagParser {
	private static TOKEN = /(?<!\S)@([A-Za-z0-9_-]+)/g;
	private static LONE_AT = /(?<!\S)@(?![A-Za-z0-9_-])/g;

	private static norm(s: string): string {
		return s.toLowerCase().replace(/[\s_-]/g, "");
	}

	private static trigrams(s: string): Set<string> {
		const out = new Set<string>();
		for (const word of s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)) {
			const padded = `  ${word} `;
			for (let i = 0; i <= padded.length - 3; i++) out.add(padded.slice(i, i + 3));
		}
		return out;
	}

	private static similarity(a: string, b: string): number {
		const A = TagParser.trigrams(a);
		const B = TagParser.trigrams(b);
		let shared = 0;
		for (const t of A) if (B.has(t)) shared++;
		const union = A.size + B.size - shared;
		return union === 0 ? 0 : shared / union;
	}

	private static editDistance(a: string, b: string): number {
		const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) => {
			const row = new Array(b.length + 1).fill(0);
			row[0] = i;
			return row;
		});
		for (let j = 0; j <= b.length; j++) dp[0]![j] = j;
		for (let i = 1; i <= a.length; i++) {
			for (let j = 1; j <= b.length; j++) {
				dp[i]![j] = Math.min(
					dp[i - 1]![j]! + 1,
					dp[i]![j - 1]! + 1,
					dp[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
				);
			}
		}
		return dp[a.length]![b.length]!;
	}

	private static displayName(token: string): string {
		const s = token.replace(/[-_]+/g, " ").trim();
		return s.charAt(0).toUpperCase() + s.slice(1);
	}

	private static resolve(token: string, tags: Tag[]): TagResult {
		const key = TagParser.norm(token);

		const exact = tags.find((t) => TagParser.norm(t.name) === key);
		if (exact) return { kind: "existing", tag: exact };

		const near = tags.filter((t) => {
			const other = TagParser.norm(t.name);
			const closeEdit = key.length >= 4 && other.length >= 4 && TagParser.editDistance(key, other) <= 1;
			return TagParser.similarity(key, other) >= 0.8 || closeEdit;
		});
		if (near.length === 1) return { kind: "near", tag: near[0]!, typed: token };

		// nothing near, or too many to guess
		return { kind: "new", name: TagParser.displayName(token) };
	}

	static extract(text: string, tags: Tag[]): TagExtraction {
		const warnings: string[] = [];
		const errors: string[] = [];

		let out = text.replace(TagParser.LONE_AT, " ");
		const matches = [...out.matchAll(TagParser.TOKEN)];
		if (!matches.length) return { text: out, tag: { kind: "none" }, warnings, errors };

		const first = matches[0]!;
		const start = first.index!;
		const end = start + first[0].length;

		if (first[1]!.length > 30) errors.push("tag is longer than 30 characters");
		if (matches.length > 1) warnings.push("multiple tags, using the first");

		out = out.slice(0, start) + " ".repeat(end - start) + out.slice(end);
		return { text: out, tag: TagParser.resolve(first[1]!, tags), warnings, errors };
	}
}

export default TagParser;