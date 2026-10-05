import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { TransactionLogType } from "@/stores/useTransactionsStore";
import { useUserStore } from "@/stores/useUserStore";
import {
  DUMMY_ACCOUNTS as ACCOUNTS,
  DUMMY_CONTACTS,
  cap,
  fmt,
  isStopWord,
  needsPerson,
  parseAmountText,
  parseNote,
  type Account,
  type Contact,
  type ParsedNote,
  type Span,
} from "@/lib/noteparser";

/* ---------- constants ---------- */
const TYPES: { id: TransactionLogType; label: string }[] = [
  { id: "EXPENSE", label: "Expense" },
  { id: "INCOME", label: "Income" },
  { id: "TRANSFER", label: "Transfer" },
  { id: "GIVE_LOAN", label: "Lent" },
  { id: "BORROW", label: "Borrowed" },
  { id: "RECEIVE_REPAYMENT", label: "Got repaid" },
  { id: "REPAY_LOAN", label: "Repaid" },
];
const typeLabel = (t: TransactionLogType) => TYPES.find((x) => x.id === t)?.label ?? t;

const EXAMPLES: { type: TransactionLogType; text: string }[] = [
  { type: "EXPENSE", text: "pepper 500 cash" },
  { type: "EXPENSE", text: "1k to my barber from /access" },
  { type: "EXPENSE", text: "2 minimie 400" },
  { type: "GIVE_LOAN", text: "I gave Tolu 10k" },
  { type: "BORROW", text: "borrowed Toluu 5k opay" },
  { type: "GIVE_LOAN", text: "lent @Mama Put 2.5k" },
  { type: "RECEIVE_REPAYMENT", text: "Femi 3k kuda" },
  { type: "TRANSFER", text: "gtb to cash 20k" },
];

const CHIP = "shrink-0 rounded-full border border-border bg-white/5 px-3 py-1.5 text-sm text-white/80 active:scale-95";
const CHIP_ON = "!border-emerald-400 !bg-emerald-400 font-medium !text-black";
const CHIP_VAL = "!border-emerald-400/40 !bg-emerald-400/10 !text-emerald-200";
const CHIP_NEW = "!border-dashed !border-sky-400/60 !text-sky-300";
const INPUT = "min-w-0 flex-1 rounded-xl border border-border bg-black/30 px-3 py-2 text-base text-white outline-none focus:border-emerald-400";
const HIDE_SCROLLBAR = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const SPAN_CLS: Record<Span["kind"], string> = {
  amount: "rounded bg-emerald-400/20 text-emerald-200",
  person: "rounded bg-sky-400/20 text-sky-200",
  account: "rounded bg-amber-400/20 text-amber-200",
};
const PILL_CLS = {
  g: "border-emerald-400/40 text-emerald-300",
  w: "border-amber-400/40 text-amber-300",
  r: "border-red-400/40 text-red-300",
  b: "border-sky-400/40 text-sky-300",
  m: "border-border text-muted",
} as const;

/* ---------- types / helpers ---------- */
type Editing = null | "amount" | "person" | "account" | "to" | "desc";
type Draft = {
  id: number;
  raw: string;
  type: TransactionLogType;
  parsed: ParsedNote;
  account: Account | null;
  toAccount: Account | null;
  amount: number | null;
  person: { name: string; contactId: string | null; isNew: boolean } | null;
  description: string;
  resolved: string[];
  editing: Editing;
};

const byId = (id: string | null) => ACCOUNTS.find((a) => a.id === id) ?? null;

/** Text wins; the chips are the fallback. */
function pickAccounts(p: ParsedNote, type: TransactionLogType | null, defAcc: string, defTo: string | null) {
  const account = p.accounts[0]?.account ?? byId(defAcc);
  const toAccount = type === "TRANSFER" ? p.accounts[1]?.account ?? byId(defTo) : null;
  return { account, toAccount, fromText: !!p.accounts[0], toText: !!p.accounts[1] };
}

const isReady = (d: Draft) =>
  d.amount != null &&
  d.account != null &&
  (!needsPerson(d.type) || d.person != null) &&
  (d.type !== "TRANSFER" || (d.toAccount != null && d.toAccount.id !== d.account.id));

type AcItem = { label: string; insert: string; isNew?: boolean };
const AT_RE = /(^|\s)@([A-Za-z]+(?: [A-Za-z]+)?)?$/;
const SL_RE = /(^|\s)\/([A-Za-z0-9]+)?$/;

/* ---------- small UI pieces ---------- */
const Pill = ({ tone, children }: { tone: keyof typeof PILL_CLS; children: ReactNode }) => (
  <span className={`rounded-full border px-2 py-0.5 text-xs ${PILL_CLS[tone]}`}>{children}</span>
);

function Echo({ text, spans }: { text: string; spans: Span[] }) {
  const out: ReactNode[] = [];
  let i = 0;
  spans.forEach((s, k) => {
    if (s.start < i) return;
    if (s.start > i) out.push(<span key={`t${k}`}>{text.slice(i, s.start)}</span>);
    out.push(<span key={`s${k}`} className={SPAN_CLS[s.kind]}>{text.slice(s.start, s.end)}</span>);
    i = s.end;
  });
  if (i < text.length) out.push(<span key="end">{text.slice(i)}</span>);
  return <div className="whitespace-pre-wrap break-words px-1 text-sm text-white/70">{out}</div>;
}

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex gap-3 border-t border-border py-2">
    <div className="w-16 shrink-0 pt-1.5 text-xs text-muted">{label}</div>
    <div className="min-w-0 flex-1">{children}</div>
  </div>
);

/* ---------- a draft card (the resolve step) ---------- */
function DraftCard({
  d, contacts, currency, onPatch, onConfirm, onDiscard,
}: {
  d: Draft;
  contacts: Contact[];
  currency: string;
  onPatch: (id: number, fn: (d: Draft) => Draft) => void;
  onConfirm: (d: Draft) => void;
  onDiscard: (id: number) => void;
}) {
  const [amtText, setAmtText] = useState("");
  const [nameText, setNameText] = useState("");
  const [descText, setDescText] = useState(d.description);
  const p = d.parsed;
  const ready = isReady(d);
  const patch = (fn: (x: Draft) => Draft) => onPatch(d.id, fn);
  const edit = (e: Editing) => patch((x) => ({ ...x, editing: e }));
  const log = (x: Draft, msg: string) => [...x.resolved, msg];

  const setAmount = (v: number, how: string) =>
    patch((x) => ({ ...x, amount: v, editing: null, resolved: log(x, `Amount → ${how} ${fmt(v)}`) }));
  const setPerson = (name: string, contactId: string | null, isNew: boolean, how: string) =>
    patch((x) => ({ ...x, person: { name, contactId, isNew }, editing: null, resolved: log(x, `Person → ${how} ${name}`) }));
  const setAcc = (a: Account) =>
    patch((x) =>
      x.editing === "to"
        ? { ...x, toAccount: a, editing: null, resolved: log(x, `To account → ${a.name}`) }
        : { ...x, account: a, editing: null, resolved: log(x, `Account → ${a.name}`) }
    );

  /* person resolve options */
  const pe = p.person;
  let hint = "Who is this?";
  let options: { contact: Contact; score: number }[] = [];
  let newNames: string[] = [];
  if (pe.status === "suggest") { hint = `Did you mean…? (typed “${pe.typed}”)`; options = pe.options; newNames = [cap(pe.typed)]; }
  else if (pe.status === "ambiguous") { hint = `Which one? (typed “${pe.typed}”)`; options = pe.options; newNames = [cap(pe.typed)]; }
  else if (pe.status === "new") { hint = `“${pe.name}” isn't in your contacts`; newNames = [pe.name]; }
  else if (pe.status === "missing") { hint = "No person found in the note"; newNames = pe.leftovers.map(cap); }

  const accountEditor = d.editing === "account" || d.editing === "to";

  return (
    <div className={`rounded-2xl border border-border border-l-[3px] bg-white/[0.03] px-3 pt-3 ${ready ? "border-l-emerald-400" : "border-l-amber-400"}`}>
      <div className="text-base font-semibold text-white">“{d.raw}”</div>
      <div className="mb-2 mt-0.5 flex items-center gap-2 text-xs text-muted">
        {typeLabel(d.type)}
        <Pill tone={ready ? "g" : "w"}>{ready ? "ready" : "needs a tap"}</Pill>
      </div>

      {/* amount */}
      <Row label="Amount">
        {d.amount != null && d.editing !== "amount" ? (
          <button className={`${CHIP} ${CHIP_VAL}`} onClick={() => edit("amount")}>{currency}{fmt(d.amount)} ✎</button>
        ) : (
          <div>
            <div className="mb-1.5 text-xs text-amber-300">
              {p.amount.status === "check" ? "Which number is the amount?" : p.amount.status === "missing" ? "No amount found. Type it:" : "Edit amount"}
            </div>
            {p.amount.candidates.length > 0 && (
              <div className="mb-1.5 flex flex-wrap gap-1.5">
                {p.amount.candidates.map((v) => (
                  <button key={v} className={CHIP} onClick={() => setAmount(v, "picked")}>{fmt(v)}</button>
                ))}
              </div>
            )}
            <div className="flex gap-1.5">
              <input className={INPUT} inputMode="decimal" placeholder="e.g. 2.5k" value={amtText} onChange={(e) => setAmtText(e.target.value)} />
              <button className={CHIP} onClick={() => { const v = parseAmountText(amtText); if (v != null) setAmount(v, "typed"); }}>Set</button>
            </div>
          </div>
        )}
      </Row>

      {/* person */}
      {needsPerson(d.type) && (
        <Row label="Person">
          {d.person && d.editing !== "person" ? (
            <button className={`${CHIP} ${CHIP_VAL}`} onClick={() => edit("person")}>
              {pe.status === "ok" && pe.guessed && d.person.contactId === pe.contact.id ? "~ " : ""}
              {d.person.name}{d.person.isNew ? " (new)" : ""} ✎
            </button>
          ) : (
            <div>
              <div className="mb-1.5 text-xs text-amber-300">{hint}</div>
              <div className="mb-1.5 flex flex-wrap gap-1.5">
                {options.map((o) => (
                  <button key={o.contact.id} className={CHIP} onClick={() => setPerson(o.contact.name, o.contact.id, false, "accepted")}>
                    {o.contact.name} · {Math.round(o.score * 100)}%
                  </button>
                ))}
                {newNames.map((n) => (
                  <button key={n} className={`${CHIP} ${CHIP_NEW}`} onClick={() => setPerson(n, null, true, "created")}>+ New “{n}”</button>
                ))}
              </div>
              <select
                className={`${INPUT} mb-1.5 w-full`}
                value=""
                onChange={(e) => { const c = contacts.find((x) => x.id === e.target.value); if (c) setPerson(c.name, c.id, false, "chose"); }}
              >
                <option value="">Pick existing…</option>
                {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="flex gap-1.5">
                <input className={INPUT} placeholder="or type a new name" value={nameText} onChange={(e) => setNameText(e.target.value)} />
                <button className={CHIP} onClick={() => { const n = nameText.trim(); if (n) setPerson(cap(n), null, true, "created"); }}>Add</button>
              </div>
            </div>
          )}
        </Row>
      )}

      {/* account(s) */}
      <Row label={d.type === "TRANSFER" ? "Accounts" : "Account"}>
        {accountEditor ? (
          <div>
            <div className="mb-1.5 text-xs text-amber-300">{d.editing === "to" ? "Transfer to…" : d.type === "TRANSFER" ? "Transfer from…" : "Pick account"}</div>
            <div className="flex flex-wrap gap-1.5">
              {ACCOUNTS.map((a) => <button key={a.id} className={CHIP} onClick={() => setAcc(a)}>{a.name}</button>)}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            <button className={`${CHIP} ${d.account ? CHIP_VAL : ""}`} onClick={() => edit("account")}>{d.account?.name ?? "Pick account"} ✎</button>
            {d.type === "TRANSFER" && (
              <button
                className={`${CHIP} ${d.toAccount && d.toAccount.id !== d.account?.id ? CHIP_VAL : "!border-amber-400/60"}`}
                onClick={() => edit("to")}
              >
                → {d.toAccount?.name ?? "pick destination"} ✎
              </button>
            )}
          </div>
        )}
      </Row>

      {/* description */}
      <Row label="Note">
        {d.editing === "desc" ? (
          <div className="flex gap-1.5">
            <input className={INPUT} value={descText} onChange={(e) => setDescText(e.target.value)} />
            <button className={CHIP} onClick={() => patch((x) => ({ ...x, description: descText.trim(), editing: null, resolved: log(x, `Note → “${descText.trim()}”`) }))}>Save</button>
          </div>
        ) : (
          <button className={CHIP} onClick={() => edit("desc")}>{d.description || "—"} ✎</button>
        )}
      </Row>

      <div className="flex justify-end gap-2 border-t border-border py-2.5">
        <button className={CHIP} onClick={() => onDiscard(d.id)}>Discard</button>
        <button
          disabled={!ready}
          onClick={() => onConfirm(d)}
          className="rounded-full bg-emerald-400 px-4 py-1.5 text-sm font-semibold text-black disabled:opacity-30"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

/* ---------- the sheet contents ---------- */
export function NoteComposer() {
  const currency = useUserStore((s) => s.data?.currency_symbol) ?? "₦";

  const [contacts, setContacts] = useState<Contact[]>(DUMMY_CONTACTS);
  const [type, setType] = useState<TransactionLogType | null>(null);
  const [defAcc, setDefAcc] = useState(ACCOUNTS[0].id);
  const [defTo, setDefTo] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [caret, setCaret] = useState(0);
  const [acIdx, setAcIdx] = useState(0);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [logged, setLogged] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [drafts.length]);

  /* live parse of whatever is being typed */
  const live = useMemo(
    () => (text.trim() ? parseNote(text, type, contacts, ACCOUNTS) : null),
    [text, type, contacts]
  );

  /* autocomplete: @ for people, / for accounts */
  const ac = useMemo(() => {
    const before = text.slice(0, caret);
    const at = needsPerson(type) ? before.match(AT_RE) : null;
    if (at) {
      const raw = at[2] ?? "";
      const q = raw.toLowerCase();
      const lastWord = raw.split(" ").pop() ?? "";
      if (raw.includes(" ") && isStopWord(lastWord, ACCOUNTS)) return null;
      const items: AcItem[] = contacts
        .filter((c) => {
          const n = c.name.toLowerCase();
          return !q || n.startsWith(q) || n.split(" ").some((w) => w.startsWith(q));
        })
        .slice(0, 4)
        .map((c) => ({ label: c.name, insert: `@${c.name} ` }));
      if (q && !contacts.some((c) => c.name.toLowerCase() === q))
        items.push({ label: `Add “${cap(raw)}” as new`, insert: `@${cap(raw)} `, isNew: true });
      if (items.length === 1 && items[0].label.toLowerCase() === q) return null;
      return items.length ? { start: caret - raw.length - 1, items } : null;
    }
    const sl = before.match(SL_RE);
    if (sl) {
      const raw = sl[2] ?? "";
      const q = raw.toLowerCase();
      const items: AcItem[] = ACCOUNTS.filter(
        (a) => !q || a.aliases.some((al) => al.startsWith(q)) || a.name.toLowerCase().startsWith(q)
      ).map((a) => ({ label: a.name, insert: `/${a.aliases[0]} ` }));
      if (items.length === 1 && items[0].insert.trim() === `/${q}`) return null;
      return items.length ? { start: caret - raw.length - 1, items } : null;
    }
    return null;
  }, [text, caret, type, contacts]);

  function pickAc(item: AcItem) {
    if (!ac) return;
    const next = text.slice(0, ac.start) + item.insert + text.slice(caret);
    const pos = ac.start + item.insert.length;
    setText(next);
    setCaret(pos);
    setAcIdx(0);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(pos, pos);
    });
  }

  /* send -> draft */
  function send() {
    const raw = text.trim();
    if (!raw || !type) return;
    const parsed = parseNote(raw, type, contacts, ACCOUNTS);
    const { account, toAccount } = pickAccounts(parsed, type, defAcc, defTo);
    const pp = parsed.person;
    const draft: Draft = {
      id: idRef.current++,
      raw,
      type,
      parsed,
      account,
      toAccount,
      amount: parsed.amount.status === "ok" ? parsed.amount.value : null,
      person: pp.status === "ok" ? { name: pp.contact.name, contactId: pp.contact.id, isNew: false } : null,
      description: parsed.description,
      resolved: [],
      editing: null,
    };
    setDrafts((prev) => [...prev, draft]);
    setText("");
    setCaret(0);
  }

  const patch = (id: number, fn: (d: Draft) => Draft) =>
    setDrafts((prev) => prev.map((d) => (d.id === id ? fn(d) : d)));

  function confirm(d: Draft) {
    if (!isReady(d)) return;
    const person = d.person;
    if (person?.isNew)
      setContacts((prev) =>
        prev.some((c) => c.name.toLowerCase() === person.name.toLowerCase())
          ? prev
          : [...prev, { id: `c${Date.now()}`, name: person.name }]
      );
    // TODO: this is where the 7 log endpoints get called, keyed by d.type
    console.log("[note → log]", {
      raw: d.raw,
      type: d.type,
      parsed: d.parsed,
      resolved: d.resolved,
      final: {
        account: d.account?.name,
        toAccount: d.toAccount?.name,
        amount: d.amount,
        counterparty: person?.name,
        counterpartyIsNew: person?.isNew,
        description: d.description,
      },
    });
    setDrafts((prev) => prev.filter((x) => x.id !== d.id));
    setLogged((n) => n + 1);
  }

  const readyDrafts = drafts.filter(isReady);
  const canSend = !!text.trim() && !!type;

  /* live preview pills */
  const acc = live ? pickAccounts(live, type, defAcc, defTo) : null;
  const pe = live?.person;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between px-5 pb-2">
        <h2 className="text-lg font-semibold text-white">Quick note</h2>
        <span className="text-xs text-muted">{logged} logged</span>
      </div>

      {/* drafts / empty state */}
      <div ref={listRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-3">
        {drafts.length === 0 ? (
          <div className="flex flex-col gap-2 text-sm text-muted">
            <p><span className="text-white">Scribble, then resolve.</span> Pick a type, write it the way you'd say it.</p>
            <p>Amount: <span className="text-emerald-300">1k</span>, <span className="text-emerald-300">500</span> or <span className="text-emerald-300">#500</span> · People: <span className="text-sky-300">@name</span> · Account: <span className="text-amber-300">/gtb</span> or just the word at the end.</p>
            <p className="mt-1">Tap to try:</p>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.text}
                className="rounded-xl border border-border bg-white/[0.03] px-3 py-2 text-left font-mono text-sm text-white"
                onClick={() => { setType(ex.type); setText(ex.text); setCaret(ex.text.length); inputRef.current?.focus(); }}
              >
                <span className="mr-2 text-xs text-muted">{typeLabel(ex.type)}</span>{ex.text}
              </button>
            ))}
          </div>
        ) : (
          <>
            {readyDrafts.length >= 2 && (
              <button
                className="rounded-full bg-emerald-400 py-2 text-sm font-semibold text-black"
                onClick={() => readyDrafts.forEach(confirm)}
              >
                Confirm all ready ({readyDrafts.length})
              </button>
            )}
            {drafts.map((d) => (
              <DraftCard
                key={d.id}
                d={d}
                contacts={contacts}
                currency={currency}
                onPatch={patch}
                onConfirm={confirm}
                onDiscard={(id) => setDrafts((prev) => prev.filter((x) => x.id !== id))}
              />
            ))}
          </>
        )}
      </div>

      {/* composer */}
      <div className="relative shrink-0 border-t border-border bg-background px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        {ac && (
          <div className="absolute inset-x-3 bottom-full z-10 mb-1 overflow-hidden rounded-2xl border border-border bg-background shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
            {ac.items.map((it, i) => (
              <button
                key={it.insert}
                onPointerDown={(e) => { e.preventDefault(); pickAc(it); }}
                className={`block w-full border-b border-border px-4 py-2.5 text-left last:border-0 ${i === acIdx ? "bg-white/10" : ""} ${it.isNew ? "text-sky-300" : "text-white"}`}
              >
                {it.label}
              </button>
            ))}
          </div>
        )}

        {/* live preview */}
        <div className="mb-2 flex min-h-6 flex-col gap-1.5">
          {live && <Echo text={text} spans={live.spans} />}
          <div className="flex flex-wrap items-center gap-1.5">
            {!type && <Pill tone="w">Pick a type</Pill>}
            {live && (
              <>
                <Pill tone={live.amount.status === "missing" ? "r" : live.amount.status === "check" ? "w" : "g"}>
                  {live.amount.value == null ? "no amount" : `${currency}${fmt(live.amount.value)}${live.amount.status === "check" ? " ?" : ""}`}
                </Pill>
                {pe && pe.status !== "na" && (
                  <Pill tone={pe.status === "ok" ? "b" : pe.status === "missing" ? "r" : pe.status === "new" ? "b" : "w"}>
                    {pe.status === "ok" ? `${pe.guessed ? "~ " : ""}${pe.contact.name}` :
                     pe.status === "suggest" ? `${pe.options[0].contact.name}?` :
                     pe.status === "ambiguous" ? "which one?" :
                     pe.status === "new" ? `new: ${pe.name}` : "no person"}
                  </Pill>
                )}
                {acc && (
                  <Pill tone={acc.fromText ? "w" : "m"}>
                    {acc.account?.name ?? "no account"}
                    {type === "TRANSFER" ? ` → ${acc.toAccount?.name ?? "?"}` : ""}
                    {!acc.fromText && !acc.toText ? " · default" : ""}
                  </Pill>
                )}
                {live.unknownAccount && <Pill tone="r">/{live.unknownAccount}?</Pill>}
                {live.description && <Pill tone="m">“{live.description.length > 22 ? `${live.description.slice(0, 22)}…` : live.description}”</Pill>}
              </>
            )}
          </div>
        </div>

        {/* type chips */}
        <div className={`mb-1.5 flex gap-1.5 overflow-x-auto ${HIDE_SCROLLBAR}`}>
          {TYPES.map((t) => (
            <button key={t.id} className={`${CHIP} ${type === t.id ? CHIP_ON : ""}`} onClick={() => setType(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* default account chips (text overrides these) */}
        <div className={`mb-1.5 flex items-center gap-1.5 overflow-x-auto ${HIDE_SCROLLBAR}`}>
          <span className="shrink-0 text-xs text-muted">{type === "TRANSFER" ? "From" : "Acct"}</span>
          {ACCOUNTS.map((a) => (
            <button key={a.id} className={`${CHIP} ${defAcc === a.id ? CHIP_ON : ""}`} onClick={() => { setDefAcc(a.id); if (defTo === a.id) setDefTo(null); }}>{a.name}</button>
          ))}
        </div>
        {type === "TRANSFER" && (
          <div className={`mb-1.5 flex items-center gap-1.5 overflow-x-auto ${HIDE_SCROLLBAR}`}>
            <span className="shrink-0 text-xs text-muted">To</span>
            {ACCOUNTS.map((a) => (
              <button key={a.id} disabled={a.id === defAcc} className={`${CHIP} ${defTo === a.id ? CHIP_ON : ""} disabled:opacity-30`} onClick={() => setDefTo(a.id)}>{a.name}</button>
            ))}
          </div>
        )}

        {/* input */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={text}
            placeholder="e.g. lent @Tobi 8k"
            enterKeyHint="send"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-full border border-border bg-black/30 px-4 py-3 text-base text-white outline-none focus:border-emerald-400"
            onChange={(e) => { setText(e.target.value); setCaret(e.target.selectionStart ?? e.target.value.length); setAcIdx(0); }}
            onSelect={(e) => setCaret(e.currentTarget.selectionStart ?? text.length)}
            onKeyDown={(e) => {
              if (ac) {
                if (e.key === "ArrowDown") { e.preventDefault(); setAcIdx((i) => (i + 1) % ac.items.length); return; }
                if (e.key === "ArrowUp") { e.preventDefault(); setAcIdx((i) => (i - 1 + ac.items.length) % ac.items.length); return; }
                if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); pickAc(ac.items[acIdx] ?? ac.items[0]); return; }
              }
              if (e.key === "Enter") { e.preventDefault(); send(); }
            }}
          />
          <button
            disabled={!canSend}
            onClick={send}
            className="h-12 w-12 shrink-0 rounded-full bg-emerald-400 text-xl font-bold text-black disabled:opacity-30"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}