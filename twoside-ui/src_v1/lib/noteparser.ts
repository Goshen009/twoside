import type { TransactionLogType } from "@/stores/useTransactionsStore";

export type Account = { id: string; name: string; aliases: string[] };
export type Contact = { id: string; name: string };

export const DUMMY_ACCOUNTS: Account[] = [
  { id: "cash", name: "Cash", aliases: ["cash"] },
  { id: "gtb", name: "GTBank", aliases: ["gtb", "gt", "gtbank", "guaranty"] },
  { id: "access", name: "Access", aliases: ["access", "accessbank"] },
  { id: "opay", name: "Opay", aliases: ["opay"] },
  { id: "kuda", name: "Kuda", aliases: ["kuda"] },
];

export const DUMMY_CONTACTS: Contact[] = [
  { id: "c1", name: "Tobi" },
  { id: "c2", name: "Tolu" },
  { id: "c3", name: "Femi Adeyemi" },
  { id: "c4", name: "Mama Put" },
  { id: "c5", name: "Chidi" },
  { id: "c6", name: "Amaka" },
  { id: "c7", name: "Peter" },
];

const PERSON_TYPES: TransactionLogType[] = ["GIVE_LOAN", "BORROW", "REPAY_LOAN", "RECEIVE_REPAYMENT"];
export const needsPerson = (t: TransactionLogType | null) => t !== null && PERSON_TYPES.includes(t);

/** Tune these against real notes. */
export const TH = { auto: 0.8, gap: 0.15, suggest: 0.4 };

const FILLER = new Set(
  "for to from at of on in the a an with by and i me my gave give given lent lend borrowed borrow paid pay received got repaid repay back was is via using through into".split(" ")
);

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const fmt = (n: number) => n.toLocaleString("en-US");

/* ---------- types ---------- */
export type Span = { start: number; end: number; kind: "amount" | "person" | "account" };
export type AmountParse = { status: "ok" | "check" | "missing"; value: number | null; candidates: number[] };
export type PersonParse =
  | { status: "na" }
  | { status: "missing"; leftovers: string[] }
  | { status: "ok"; contact: Contact; guessed: boolean; typed: string }
  | { status: "suggest" | "ambiguous"; typed: string; options: { contact: Contact; score: number }[] }
  | { status: "new"; typed: string; name: string };
export type FoundAccount = { account: Account; via: "symbol" | "tail"; start: number };
export type ParsedNote = {
  amount: AmountParse;
  person: PersonParse;
  accounts: FoundAccount[];
  unknownAccount: string | null;
  description: string;
  spans: Span[];
};

/* ---------- fuzzy helpers ---------- */
function tri(s: string): Set<string> {
  const out = new Set<string>();
  for (const w of s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)) {
    const p = `  ${w} `;
    for (let i = 0; i < p.length - 2; i++) out.add(p.slice(i, i + 3));
  }
  return out;
}
export function sim(a: string, b: string): number {
  const A = tri(a), B = tri(b);
  if (!A.size || !B.size) return 0;
  let shared = 0;
  for (const t of A) if (B.has(t)) shared++;
  return shared / (A.size + B.size - shared);
}
function lev(a: string, b: string): number {
  const m = a.length, n = b.length;
  const d: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array<number>(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}

export function matchAccount(word: string, accounts: Account[], fuzzy = true): Account | null {
  const w = word.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!w) return null;
  for (const a of accounts) if (a.aliases.includes(w)) return a;
  if (!fuzzy || w.length < 4) return null;
  for (const a of accounts) if (a.aliases.some((al) => al.length >= 4 && lev(w, al) <= 1)) return a;
  return null;
}

export const isStopWord = (w: string, accounts: Account[]) =>
  FILLER.has(w.toLowerCase()) || !!matchAccount(w, accounts, false);

function rank(tok: string, contacts: Contact[]) {
  return contacts
    .map((c) => ({
      contact: c,
      score: Math.max(sim(tok, c.name), ...c.name.split(/\s+/).map((p) => sim(tok, p))),
    }))
    .sort((a, b) => b.score - a.score);
}

function classify(typed: string, contacts: Contact[]): PersonParse {
  const r = rank(typed, contacts);
  const a = r[0], b = r[1];
  if (!a || a.score < TH.suggest) return { status: "new", typed, name: cap(typed) };
  const gap = b ? a.score - b.score : 1;
  const options = r.slice(0, 3);
  if (a.score >= TH.auto && gap >= TH.gap) return { status: "ok", contact: a.contact, guessed: a.score < 1, typed };
  if (b && b.score >= TH.suggest && gap < TH.gap) return { status: "ambiguous", typed, options };
  return { status: "suggest", typed, options };
}

/* ---------- amounts ---------- */
const AMT = /(#\s*)?(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?([kKmMhH])?(?![A-Za-z0-9])/g;
type Hit = { value: number; start: number; end: number; hash: boolean; suffix: string };

function scanAmounts(s: string): Hit[] {
  const hits: Hit[] = [];
  for (const m of s.matchAll(AMT)) {
    const idx = m.index ?? 0;
    const prev = idx > 0 ? s[idx - 1] : "";
    if (prev && /[A-Za-z0-9]/.test(prev)) continue;
    const suffix = (m[4] ?? "").toLowerCase();
    const mult = suffix === "k" ? 1e3 : suffix === "m" ? 1e6 : suffix === "h" ? 100 : 1;
    const value = Math.round(parseFloat(m[2].replace(/,/g, "") + (m[3] ?? "")) * mult);
    hits.push({ value, start: idx, end: idx + m[0].length, hash: !!m[1], suffix });
  }
  return hits;
}

/** For the "type an amount" box in the resolve step. */
export function parseAmountText(s: string): number | null {
  const hits = scanAmounts(s);
  return hits.length ? hits[hits.length - 1].value : null;
}

/* ---------- the parser ---------- */
export function parseNote(
  text: string,
  type: TransactionLogType | null,
  contacts: Contact[],
  accounts: Account[]
): ParsedNote {
  const wantPerson = needsPerson(type);
  const mask = new Array<boolean>(text.length).fill(false);
  const spans: Span[] = [];
  const take = (start: number, end: number, kind: Span["kind"]) => {
    for (let i = start; i < end; i++) mask[i] = true;
    spans.push({ start, end, kind });
  };
  const masked = () => text.split("").map((c, i) => (mask[i] ? " " : c)).join("");

  /* 1) /account symbols */
  const found: FoundAccount[] = [];
  let unknownAccount: string | null = null;
  for (const m of text.matchAll(/(^|\s)\/([A-Za-z][A-Za-z0-9]*)/g)) {
    const start = (m.index ?? 0) + m[1].length;
    take(start, start + 1 + m[2].length, "account");
    const acc = matchAccount(m[2], accounts);
    if (acc) found.push({ account: acc, via: "symbol", start });
    else unknownAccount = m[2];
  }

  /* 2) @person (existing contact, or free-typed name that stops at a number/symbol/filler/account word) */
  let person: PersonParse = wantPerson ? { status: "missing", leftovers: [] } : { status: "na" };
  let personDone = false;
  if (wantPerson) {
    const at = text.indexOf("@");
    if (at >= 0) {
      const rest = text.slice(at + 1);
      const low = rest.toLowerCase();
      const exact = [...contacts]
        .sort((a, b) => b.name.length - a.name.length)
        .find((c) => {
          const n = c.name.toLowerCase();
          return low.startsWith(n) && !/[a-z0-9]/i.test(rest[n.length] ?? " ");
        });
      if (exact) {
        take(at, at + 1 + exact.name.length, "person");
        person = { status: "ok", contact: exact, guessed: false, typed: exact.name };
        personDone = true;
      } else {
        const typed: string[] = [];
        let end = 0;
        for (const w of rest.matchAll(/\S+/g)) {
          const clean = w[0].replace(/[.,;:!?]+$/, "");
          if (!/^[A-Za-z][A-Za-z'’-]*$/.test(clean)) break;
          if (isStopWord(clean, accounts) || typed.length >= 3) break;
          typed.push(clean);
          end = (w.index ?? 0) + clean.length;
        }
        if (typed.length) {
          take(at, at + 1 + end, "person");
          person = classify(typed.join(" "), contacts);
          personDone = true;
        }
      }
    }
  }

  /* 3) amount: #n > k/m suffix > last plain number > h suffix (weakest, "2h" may be hours) */
  const hits = scanAmounts(masked());
  const hashed = hits.filter((h) => h.hash);
  const strong = hits.filter((h) => !h.hash && (h.suffix === "k" || h.suffix === "m"));
  const plain = hits.filter((h) => !h.hash && !h.suffix);
  const weak = hits.filter((h) => !h.hash && h.suffix === "h");
  const pool = hashed.length ? hashed : strong.length ? strong : plain.length ? plain : weak;
  let amount: AmountParse = { status: "missing", value: null, candidates: [] };
  if (pool.length) {
    const pick = pool[pool.length - 1];
    take(pick.start, pick.end, "amount");
    const all = [...new Set(hits.map((h) => h.value))];
    const ambiguous = !hashed.length && strong.length > 1; // two "1k"-style numbers -> ask
    amount = { status: ambiguous ? "check" : "ok", value: pick.value, candidates: all.length > 1 ? all : [] };
  }

  /* 4) account by words (no symbol): last two words, or the whole note for transfers */
  const wantAll = type === "TRANSFER";
  const need = wantAll ? 2 : 1;
  if (found.length < need) {
    const toks = [...masked().matchAll(/[^\s,;]+/g)].map((m) => {
      const w = m[0].replace(/[.!?:]+$/, "");
      const start = m.index ?? 0;
      return { w, start, end: start + w.length };
    });
    for (const t of wantAll ? toks : toks.slice(-2)) {
      if (found.length >= need) break;
      let acc = matchAccount(t.w, accounts, false);
      if (!acc && !wantAll && !contacts.some((c) => sim(t.w, c.name) >= TH.auto)) acc = matchAccount(t.w, accounts, true);
      if (acc && !found.some((f) => f.account.id === acc!.id)) {
        take(t.start, t.end, "account");
        found.push({ account: acc, via: "tail", start: t.start });
      }
    }
  }

  /* 5) person without @: fuzzy over leftover words (singles + adjacent pairs) */
  if (wantPerson && !personDone) {
    const ms = masked();
    const words = [...ms.matchAll(/[A-Za-z][A-Za-z'’-]*/g)].map((m, i) => ({
      w: m[0], start: m.index ?? 0, end: (m.index ?? 0) + m[0].length, i,
    }));
    const usable = words.filter((x) => x.w.length > 2 && !isStopWord(x.w, accounts));
    const cands = usable.map((x) => ({ text: x.w, start: x.start, end: x.end }));
    for (let k = 0; k < usable.length - 1; k++) {
      const a = usable[k], b = usable[k + 1];
      if (b.i === a.i + 1 && /^\s+$/.test(ms.slice(a.end, b.start)))
        cands.push({ text: ms.slice(a.start, b.end), start: a.start, end: b.end });
    }
    let best: { c: (typeof cands)[number]; score: number } | null = null;
    for (const c of cands) {
      const r = rank(c.text, contacts)[0];
      if (r && (!best || r.score > best.score || (r.score === best.score && c.text.length > best.c.text.length)))
        best = { c, score: r.score };
    }
    if (best && best.score >= TH.suggest) {
      take(best.c.start, best.c.end, "person");
      person = classify(best.c.text, contacts);
    } else if (usable.length === 1 && /^[A-Z]/.test(usable[0].w)) {
      take(usable[0].start, usable[0].end, "person");
      person = { status: "new", typed: usable[0].w, name: cap(usable[0].w) };
    } else {
      person = { status: "missing", leftovers: usable.map((x) => x.w).slice(0, 3) };
    }
  }

  /* 6) description = what's left, minus filler at the edges */
  const toks = masked().replace(/[#@/]/g, " ").split(/\s+/).filter((t) => /[A-Za-z0-9]/.test(t));
  const isEdge = (t: string) => FILLER.has(t.toLowerCase().replace(/[.,;:!?]+$/, ""));
  while (toks.length && isEdge(toks[0])) toks.shift();
  while (toks.length && isEdge(toks[toks.length - 1])) toks.pop();

  return {
    amount,
    person,
    accounts: found.sort((a, b) => a.start - b.start),
    unknownAccount,
    description: toks.join(" "),
    spans: spans.sort((a, b) => a.start - b.start),
  };
}