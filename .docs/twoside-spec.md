# Twoside — App Specification

*Written by Goshen (backend) for the UI/UX designer.*

---

## 0. How to read this document

This document describes **what Twoside is and what it does**. It is a functional and
behavioural spec, not a style guide. The visual language, the layouts, the iconography,
the motion — all of that is yours. Where this document gets specific about a flow
(what fields exist, what order things happen in, what errors appear), that specificity
is about *behaviour*, because those parts are tied to how the backend actually works.
Everything else is open.

Three things to know before you start:

1. **This is a mobile-first design, even though it ships on the web.** Twoside is
   released as a PWA (installable web app) and the expectation is that essentially
   everybody uses it on their phone. Design for a phone screen first. Desktop is a
   secondary, "it should still not look broken" concern.

2. **Dark mode only.** There is no light theme. This is a deliberate choice, not an
   oversight. The app is already built around a near-black palette.

3. **Some parts of this document will read like instructions to a developer** —
   things like "the sheet slides up from the bottom", "this field animates in",
   "confetti on save", timing, easing, state transitions. Those lines are written for
   the AI agent that builds the app after you, so **please don't feel you need to
   design around them.** I've left them in only so you can see the whole picture.
   Sketch the screens and let the motion notes go past you. If you do have an idea for
   how a transition should feel, I'd genuinely love to hear it — but nothing here
   expects you to spec that.

Where this document says **"current app"**, it means: *this already exists and works,
and it's the shape I want.* Where it says **"planned"**, it means: *this is decided but
not built yet.*

---

## 1. What Twoside is

Twoside is a personal money tracker. It does **two** core things:

1. **Tracks income and expenses** — where your money came from, where it went.
2. **Tracks loans** — money you lend to people, and money you borrow from people.

That's it. That's the whole app. Everything in the product exists to serve one of
those two jobs, and the second one (loans) is where the app is genuinely different
from everything else out there.

The name is a play on **"two sides"**: every transaction has two sides (money leaves
one place, arrives in another), and every loan relationship has two sides (you and
the other person). The app is built on real double-entry bookkeeping under the hood,
which is what lets it track loans correctly without corrupting your income/expense
numbers. **You don't need to understand or design around the accounting** — it's
invisible to the user — but it's why some of the behaviours below are the way they are.

The in-app wordmark is currently the lowercase word **twoside** followed by a period
in accent green: `twoside.` — I'll send you a picture of what we have now. You are
welcome to propose something better.

---

## 2. The two things that matter most

These came out of conversations with real people I want to build this for. They are
the two criteria I'd use to judge whether the design is right.

### 2.1 Recording a transaction must be effortless

This was the single most consistent piece of feedback. The people I talked to are
**on the road, standing in a shop, mid-conversation** when they need to record
something. Every app they've tried — and every spreadsheet they've tried — makes this
hard. They open it, and then they have to think, navigate, hunt for the right screen.

The requirement that comes out of that:

> **From the home screen, a user should be able to see where they record a transaction
> and get there in one or two taps, maximum.**

This is a hard requirement, not a nice-to-have. It's the main thing I'd want the
design to nail.

And it's not only about the home screen. **Recording any transaction — not just loans —
needs to be reachable from anywhere in the app** in one tap, or two at the very most.
Wherever the user happens to be — home, the loans page, settings, anywhere at all — the
way to log something can never be more than a tap or two away. People log things at
unexpected moments ("I just handed Tunde 5k" is the classic one), and if logging it
takes longer than a moment, it simply doesn't get logged.

### 2.2 It has to be fun

One person, unprompted, said the app should be **fun to use**. They compared it to
Duolingo — not just *usable*, but something you don't mind opening. I'll be honest:
I'm not 100% sure what they meant. My suspicion is they meant things like a mascot,
streaks, celebratory moments, a personality — but I might be wrong.

I'll add my own version of this: **I don't want the app to take itself too seriously.**
Money apps are usually very stern and corporate and grey. I'd like the buttons to feel
playful and a little goofy. This is genuinely important to me, and it's the area where
I'd most like you to push back, propose things, and tell me what you think is right.

---

## 3. The mental model (read this before the screens)

Three concepts carry the whole app. If the design makes these three obvious, everything
else falls out naturally.

### 3.1 Accounts

An account is **anywhere you keep money or make payments from**. That's broader than
it sounds — it's not just bank accounts. A user might have:

- a **Cash** account (the physical money in their pocket)
- **Bank** / **UBA** / **Access Bank** / **GTBank** accounts
- **Opay** / **Palmpay** / **Moniepoint** wallets
- a **Savings** account

The point is: for every place they store money and pay from, they can have an account,
and the app shows them the balance of each one. This is in contrast to a spreadsheet,
where you'd have one "balance" column and no idea which pocket the money is actually in.

A new user starts with sensible defaults already created (Cash, Bank, Savings) so they
never face an empty app. They can add more later.

**The home screen is built around switching between these accounts.** That's the single
most important interaction on it — see §7.2.

### 3.2 Categories (expenses only)

A category is a **label you stick on an expense** so you can later ask "how much did I
spend on transport this month?". Examples: Transport, Groceries, Data, Rent, Eating Out.

Two things to know about categories:

- **They apply to expenses and nothing else.** Income doesn't get a category. Transfers
  don't. Loans don't.
- **They're optional.** You can log an expense with no category at all. Nobody should
  ever be forced to categorise something on the road — being fast matters more than
  being tidy.

Categories can be picked from a list, or **created on the spot by typing a new name**
while you're logging the expense. The user never has to leave the flow to go and set a
category up first. There is no separate "manage categories" screen needed for this to
work (though one will exist later, in Settings — see §7.4).

### 3.3 Charges (fees)

This one is small but it matters a lot for accuracy, and it comes up constantly in
Nigeria.

**The problem:** you intend to pay ₦5,000. Your bank charges ₦10. What actually leaves
your account is ₦5,010. If the app only lets you record ₦5,000, your balance is wrong
forever, and every subsequent balance is wrong too.

**The solution:** when you pick an account and enter an amount, you can *optionally*
also enter a charge. So:

- **Money going out** (expense, transfer, giving a loan, repaying a loan): the charge is
  **added on top**. You wanted to send 5,000, the fee was 10, so 5,010 leaves the account.
- **Money coming in** (income, receiving a repayment): the charge is **deducted**. Someone
  sent you 5,000, the fee was 10, so 4,990 actually lands.

The charge is always optional and defaults to zero. If you leave it blank, nothing
changes — that's the common case. It's there for the times it matters.

The charge is expressed in the same currency as the account, and it's per-account-row
(see the next section — if a transaction touches two accounts, each one can have its
own charge).

### 3.4 Compound entries — one event, several accounts

This is the concept I'd most like the design to make feel natural, because it's the one
that's genuinely hard to explain in words.

**The situation:** I need to pay someone ₦5,000. I only have ₦3,000 in my bank account.
I have ₦2,000 in cash in my pocket. So I pay ₦3,000 from the bank and ₦2,000 from cash.

**The bad version:** I record two separate transactions, both described "Paid Tunde",
for 3,000 and 2,000. Now my history is cluttered with what looks like two events when
it was really one. And if it was a loan, the person now appears to have received two
loans instead of one.

**The version Twoside does:** I record **one** transaction, with the same description
and the same date and time, that has **two source accounts** — 3,000 from Bank, 2,000
from Cash. It's one event in the history, one entry, one thing to look at. Under the
hood it's correct across both accounts.

So: a single expense (or income, or loan) can be paid from — or received into —
**multiple accounts at once**. The user adds rows. Each row is *account + amount +
optional charge*. If they only need one row (the overwhelmingly common case), they see
one row and never think about it.

Money **out** uses **sources** (the accounts money leaves).
Money **in** uses **destinations** (the accounts money arrives in).

This applies to every type that touches an account — expenses, income, transfers'
siblings, loans, repayments. It's not a loans-only idea.

### 3.5 Counterparties (the other person in a loan)

A counterparty is **a person you lend to or borrow from**. That's the term I've been
using internally, and honestly I don't love it — it's accounting jargon. If you have a
better word for it ("Person"? "Contact"? just their name?) I'd genuinely like to hear it.

They exist so that the app can answer "who owes me money, and how much?" — which is half
the reason this app exists.

Like categories, a counterparty can be **typed in on the spot** while logging a loan.
You don't have to create them first.

---

## 4. The transaction types

Twoside lets a user log **seven** kinds of events. They're split into two groups, and
the split is meaningful — it's how they're grouped in the UI when you tap "+".

**Core (three):**

| Type | What it means | Money |
|---|---|---|
| **Expense** | You spent money from an account | out of **source** accounts |
| **Income** | Money came into an account | into **destination** accounts |
| **Transfer** | You moved money between your own accounts | exactly one account → exactly one account |

**Loans (four):**

| Type | What it means | Money |
|---|---|---|
| **Give Loan** | You lent money to someone | out of **source** accounts |
| **Borrow** | Someone lent money to you | into **destination** accounts |
| **Repay Loan** | You paid back money you borrowed | out of **source** accounts |
| **Receive Repayment** | Someone paid back money you lent them | into **destination** accounts |

Notice the symmetry: Give Loan mirrors Borrow, Repay Loan mirrors Receive Repayment.
The two "repay" types are special because **they're attached to an existing loan** —
you pick which loan you're settling, rather than describing it from scratch.

---

## 5. The flows, screen by screen

### 5.1 Splash

**Planned.** A splash screen showing the **twoside.** logo, which appears while the app
is checking whether the user is already logged in, then routes them either to the login
screens or to the home screen.

> **For the builder:** this is where the session check happens. The user should never
> see a flash of the wrong screen — the splash holds until the check resolves.

This should feel like a moment, not a delay. It's the first thing anyone sees.

---

### 5.2 Registration

**Planned.** The current build takes a username and password, but that was a
quick-and-dirty placeholder. The real flow is **email-first**, and it goes like this:

**Step 1 — Enter your email.**

A single field. That's the whole screen. No password here.

**Step 2 — Verify the OTP.**

We send a one-time code to that email. The user types it in to prove the address is
really theirs.

> **Important design note:** I do **not** want the six-separate-boxes OTP input. I want a
> **single field** that holds the whole code — the way GitHub does it. The reason is
> practical: copy-paste. With six boxes, pasting a code from an email is fiddly and
> often broken. One field means one paste and you're done. **This is a firm requirement.**

What this screen also needs:

- **A countdown / resend control.** Something like *"Didn't get the code? You can send
  another one in 42s"* which becomes a **Resend** action once the timer runs out.
- **A "wrong email?" escape hatch.** If they typo'd their address, they need a way back
  to Step 1 to re-enter it. This must be obvious and easy to find — it's a dead end
  otherwise.
- **An error state for a wrong code.** Simple, inline, doesn't lose what they typed.
- **A "too many attempts" state.** After **5 wrong codes in a row**, the app stops
  accepting attempts and tells them to try again in X minutes. This can use the same
  visual treatment as the wrong-code error — it doesn't need to be a separate design —
  it just says something different.

**Step 3 — Onboarding.** See §5.5.

---

### 5.3 Login

**Planned** (currently username + password; moving to email + password).

Deliberately symmetric with registration, so it should feel like the same family of
screen.

- **Email** field
- **Password** field (with a show/hide toggle)
- **Log In** button
- A link across to **Create an account**

Error states it needs:

- **Invalid credentials** — wrong email or password. (Deliberately vague about *which*
  one is wrong; that's a security thing, not an oversight.)
- **Too many attempts** — *"Please wait X seconds and try again."* Same treatment as
  above.

**This screen should be pretty.** If there are animations, illustrations, icons, a
little life to it — bring them. Same for registration. These are the screens a person
sees when they're deciding whether the app is any good, and right now they're the
plainest screens in the app, which I'd like to fix.

---

### 5.4 Forgot password

**Planned.** Straightforward, and it reuses pieces that already exist.

1. User taps **Forgot password?** on the login screen.
2. They enter their email.
3. They request a code.
4. They enter the OTP.
5. On success, they land on a screen to set a **new password** — password + confirm
   password.

Reuse notes:

- The **OTP screen is the same screen as registration's.** Same component, same
  behaviour, same countdown, same errors. No need for a second design.
- The **password+confirm screen is the same screen as onboarding's first step.** Same
  component, different heading. See below.

---

### 5.5 Onboarding (after first verification)

**Planned.** Four things, across two screens. New users hit this once, right after they
verify their email, and never again.

**Screen 1 — Password.**

- Password
- Confirm password

*This is deliberately its own screen* so that the forgot-password flow (§5.4) can
reuse it exactly, with a different heading. Two screens, one design.

**Screen 2 — Everything else.**

- **What should we call you?** — a normal text field.
- **What currency do you use?** — a dropdown. For the UI, Naira, Dollar and Pound are
  enough to design against.
- **What's your timezone?** — a dropdown.

Two details I'd like on this screen:

- **When a currency is selected, show a small live example of it formatted** — something
  like `₦123,456.78` — so the user can immediately see what their money will look like
  in the app. It's a tiny thing that makes the choice feel real instead of abstract.
- The timezone list is short and known, so a plain dropdown is fine. Current options:
  `Africa/Lagos`, `Africa/Accra`, `Europe/London`, `Australia/Sydney`,
  `America/New_York`.

**Then a submit button.** Something to finish onboarding — call it whatever feels right
for the tone of the app ("Let's go", "Enter", "Done"). I'd like this button in particular
to be a bit of a moment. It's the last thing between the user and the app.

---

## 6. Logging a transaction (the core interaction)

This is the most important flow in the app, so I'm going to be exhaustive about it.

### 6.1 How it opens

**Current app.** There's a **+** button in the centre of the bottom navigation bar,
raised above the other items and visually the most prominent thing in the nav — which
is exactly right, because it's the thing people will tap most.

Tapping it opens a **bottom sheet** that comes up over whatever screen you're on, so
**you never lose your place.** From the home screen that's one tap. From anywhere else
it's also one tap, because the nav bar is on every screen.

The sheet has two stages:

1. **Pick a type** — the seven transaction types, grouped into the three **core** types
   (Expense, Income, Transfer) listed straight away, then a **"Loans"** section header
   with the four loan types beneath it. Each row is an icon in the type's accent colour,
   the name, and a short plain-language description of what it does — *"Spend from an
   account"*, *"Lend money to someone"*, *"Collect money you lent"* — plus a chevron.
   These need to be instantly scannable: the user already knows what they want to do,
   they just need to find it.
2. **Fill the form** — the sheet swaps to the form for the type they picked, with a
   **back arrow** in the header to return to the type list.

Every type has its own accent colour, and the form adopts it — so a Give Loan form
feels amber, an Expense form feels red/pink, and so on. It's a small cue that tells you
which mode you're in, and it carries through to the icons in the history feed so a
transaction looks the same everywhere it appears.

### 6.2 Fields shared by every form

These appear in all seven, and should behave the same way everywhere:

- **Description** — required, up to 100 characters, plain text. The label is
  "Description" and the placeholder is phrased per transaction type (see below), so
  even the placeholder quietly reminds you what you're logging.
- **Date and time** — required. Defaults to **now**, because that's what it almost
  always is. Editable, because sometimes you're logging something from yesterday.
  Format shown to the user as a readable date+time, not a raw timestamp.

Current per-type description placeholders (these are just the current phrasing — they're
yours to improve, but the "one event, one description" idea should stay):

| Type | Placeholder |
|---|---|
| Expense | *What did you spend this on?* |
| Income | *What is this income for?* |
| Transfer | *What is this transfer for?* |
| Give Loan | *Who did you lend to and why?* |
| Borrow | *Who did you borrow from and why?* |
| Repay Loan | *What is this repayment for?* |
| Receive Repayment | *What is this repayment for?* |

### 6.3 Fields that are about accounts

Every form touches at least one account, and the control is the same shape:

- **Account** — a picker (bottom sheet listing the user's accounts) that also allows
  searching. Opens a sheet rather than a native dropdown, because the user's account
  names should be big and tappable on a phone. The picker's title and the account
  field's placeholder change with the direction of the form — *"Select account to spend
  from"*, *"Select account to receive into"*, *"Select account to lend from"*,
  *"Select account to repay from"* — so the user always knows which way the money is
  moving.
- **Amount** — required, must be greater than zero, up to 2 decimal places. Placeholder
  is a bare `0`.
- **Charge** — optional, defaults to empty/zero, up to 2 decimal places, can't be
  negative. Placeholder is a bare `0`.

When a form supports multiple accounts (§3.4), these rows stack vertically and there's:

- an **"Add account"** affordance below the rows
- a way to **remove** a row
- a **"Total"** line showing the amounts adding up

And then a second, subtler line underneath — this is the charge doing its work, and it's
worth designing well because it's where the user sees that a fee changed what actually
moved:

- On money **out**, the total is labelled **"Total paid"** and the charges are **added**:
  you typed 5,000, the fee was 10, and it reads `Total paid ₦5,010`. The `+` is shown.
- On money **in**, the total is labelled **"Net received"** and the charges are
  **deducted**: someone sent 5,000, the fee was 10, and it reads `Net received ₦4,990`.
  The `−` is shown.

In both cases the charge line only appears **if there actually is a charge**. If there's
no fee, the user just sees a plain total and never knows the feature exists.

The rule that **the same account can't appear twice in one transaction** is enforced,
with a clear error if someone tries. It doesn't make sense to pay 3,000 from an account
and also 2,000 from the same account as two separate rows — that's one row of 5,000.

### 6.4 The seven forms, field by field

Legend: **required** unless marked optional. The button labels are what's in the build
today — plain and literal. **They're a good candidate for the "fun" pass**; I'd rather
these were playful than descriptive, as long as it stays obvious what each one does.

#### Expense
- Description — *"What did you spend this on?"*
- Date and time
- **Category** — *optional.* Labelled with a small "Optional" tag, placeholder
  *"Categorize this as…"*. Picker with search, including a **"Create new…"** row that
  swaps the list for a text field (*"New category name"*). This is the only form with a
  category, and it should feel genuinely optional — easy to skip, easy to fill. Not a nag.
- **Sources** — one or more rows of account + amount + optional charge
- **Record Expense**

#### Income
- Description — *"What is this income for?"*
- Date and time
- **Destinations** — one or more rows of account + amount + optional charge
- **Record Income**

Notice: **no category on income.** That's intentional.

#### Transfer
- Description — *"What is this transfer for?"*
- Date and time
- **Amount** — a single amount (not a list of rows)
- **Charge** — optional, single
- **From account** — labelled "From", picker titled *"Transfer from"*
- **To account** — labelled "To", picker titled *"Transfer to"*
- **Record Transfer**

Transfer is strictly **one account to one account.** It does not support compound rows.
The two accounts also can't be the same account — the picker should prevent it (if you
pick an account that's already on the other side, that side clears), and there's an
error as a backstop.

#### Give Loan
- Description — *"Who did you lend to and why?"*
- Date and time
- **Counterparty** — placeholder *"Who are you lending to?"*. Picker with search, plus a
  **"Create new…"** row (*"New counterparty name"*) to add someone on the spot.
- **Sources** — one or more rows of account + amount + optional charge
- **Lend Money**

#### Borrow
- Description — *"Who did you borrow from and why?"*
- Date and time
- **Counterparty** — placeholder *"Who are you borrowing from?"*, same picker as above
- **Destinations** — one or more rows of account + amount + optional charge
- **Borrow Money**

#### Repay Loan *(paying back what you borrowed)*
- **Which loan?** — placeholder *"Which loan are you repaying?"*, picker titled the same.
  See §6.5 — this is important.
- Description — *"What is this repayment for?"*
- Date and time
- **Sources** — one or more rows of account + amount + optional charge
- **Repay Loan**

#### Receive Repayment *(collecting what you lent)*
- **Which loan?** — placeholder *"Which loan is being repaid?"*, same picker
- Description — *"What is this repayment for?"*
- Date and time
- **Destinations** — one or more rows of account + amount + optional charge
- **Receive Repayment**

**When a warning is pending (§8.1), the submit button changes to say so.** It becomes
*"Bypass & Record Expense"*, *"Bypass & Lend Money"*, *"Bypass & Record Transfer"*,
*"Bypass & Repay Loan"*, *"Bypass & Receive Repayment"*. I like this more than a modal —
the button itself becomes the confirmation, and it's unambiguous about what's about to
happen. Worth keeping and polishing.

### 6.5 The loan picker (used by both repayment forms)

This is the payoff of the whole loans feature, so it deserves care.

When a user goes to repay or collect, the app shows them **the loans they already
logged** — they never re-describe a loan that's already in the system. The picker lists
**open loans only** (fully-paid-off ones aren't relevant here).

**Each row in the picker shows:**

- **The counterparty's name** — who it's with
- **The date the loan was issued**
- **How much is still outstanding** — the remaining balance, shown prominently
- **The original amount** — as secondary text underneath, so "₦3,000 *of* ₦10,000" reads
  at a glance as "they've paid back 3,000 of the 10,000"

The outstanding figure should be the visually dominant number. That's the number that
tells you which loan this is. The original amount is context.

Once a loan is chosen, the form shows the **chosen loan's counterparty and its
outstanding balance** right there in the form, so the user can keep it in view while
typing the amount. Because `2,000` means something very different if the outstanding
balance is `2,000` versus `200,000`.

*Note: this picker currently shows all open loans in one list — it doesn't ask you to
pick the person first.*

---

## 7. The main screens

### 7.1 Navigation

**Current app.** A bottom tab bar, fixed, present on every logged-in screen. It has five
slots, with the **+** in the middle, raised and emphasised:

`Home` · `Loans` · **`+`** · `History` · `Log out`

Two of those are placeholders today. **History** is inert — nothing happens when you tap
it, and honestly I don't yet know what belongs there: the home screen already shows the
transaction feed, so I'm not clear on what a separate "history" would add. **Log out** as
a top-level tab is also wrong — logging out isn't a primary destination, and it's using a
slot that should belong to **Settings**.

**What I'm expecting:** `Home` · `Loans` · **`+`** · `Transactions` · `Settings`, with
logout moved inside Settings where it belongs (§7.4).

On that fourth slot — the screen behind it would carry roughly what the home screen
carries today: the transaction list, with the same detail and the same filtering. Think
of it as the transactions screen proper, with Home being the at-a-glance version of it.
Its exact shape is still open, so treat it as loosely as you'd treat Settings.

### 7.2 Home

The home screen is where a user answers *"where does my money stand, and what's been
happening?"* Two things belong here: their balances, and their transactions.

**What we need: a way to see the balance of every account, and the total across all of
them.** The current app does this as a **horizontally swipeable card** — the first card
is "All Accounts" (the combined net total), and swiping moves through each individual
account with its own balance, with a small counter (`2 / 5`) showing where you are in
the stack.

**Switching accounts should also narrow the list below it.** In the current app,
selecting an account on that carousel filters the transaction list down to just that
account — so "show me only my Cash spending" is one gesture instead of a trip through a
filter menu. That connection between the two halves of the screen is the thing I care
most about here, and I'd want it kept in some form.

One behaviour worth knowing about, from the current app: when the balance card scrolls
out of view, a **small floating pill** takes its place at the top showing which account
is currently selected, so that context is never lost while scrolling. A jump-to-top
control appears alongside it.

**What we need: a way to see all of the user's transactions, newest first.** Each
transaction has these details available, and we need somewhere to surface them:

- the **type** — expense, income, transfer, or one of the four loan types — each with its
  own icon and colour
- the **description**
- the **date**, down to the time
- the **amount**, with a direction (+/−) so money in and money out read differently
- the **account** it belongs to — useful when the list spans every account, and
  redundant once the user has narrowed to one
- the **other account**, for transfers
- the **counterparty**, for anything loan-related
- the **category**, if the expense has one
- the **fee/charge**, if there was one

We also need to be able to **open a single transaction and see its full details
together** — the same set of things as above, in one place. One rule on the amount shown
there: money coming **in** should read as the gross received (the fee added back), and
money going **out** as the total that actually left (amount plus fee). The headline
number should always mean "what really moved".

**Filters we need:**

- **By category** — so a user can ask "what did I spend on transport?"
- **By date** — both a **from-this-date-to-that-date range** and a **jump to a specific
  date**, so someone can get to a point in history without scrolling all the way there.

**States we need to account for:** nothing logged at all, an account with no
transactions in it, and filters that match nothing. Each should say something useful
rather than showing a blank screen. The list should also keep loading as the user
scrolls.

### 7.3 Loans

This is the screen that makes Twoside worth using.

**What we need: a way to see all of the user's loans in one place.** A loan has these
details available:

- the **counterparty** — who it's with
- the **direction** — money you're owed, or money you owe
- the **date it was issued**
- the **description**
- the **original amount**
- **how much has been repaid** so far
- **how much is still outstanding**
- the **status** — open, partially repaid, or fully paid off

The current app lists them with the counterparty, the date and description, and the
outstanding amount, with the original amount underneath as context. Paid-off loans are
visually de-emphasised. Colour carries the direction, so "money you're owed" and "money
you owe" read differently at a glance — I like that and would want it kept.

**What we need: a way to open a single loan and see its whole story** — the amounts
above, plus **every repayment made against it**, each with its date, the account it went
through, and the amount. This is the view that makes the app trustworthy: a user can
always see how a remaining balance got to where it is. When a loan has no repayments
yet, that should read as a clear empty state rather than a blank space.

**Filters we need:**

- **Open / paid off** — where "open" includes partially-repaid loans, since a partly-paid
  loan is still open
- **By counterparty** — narrowing the list to one person, so a user can answer "how much
  does Tunde owe me?" That's a question people ask constantly.
- **By direction** — all loans, money you're owed, or money you owe
- **By date** — the same from/to range and jump-to-date that the transactions list needs

**One change from the current build:** it currently leads with two big aggregate figures
— *total you're owed* and *total you owe*. **I want those gone.** Seeing the actual list
of debts, filterable by person, is more useful than a pair of summary numbers — the list
is the point, and the totals flatten it.

We also need this screen to hold up when there's nothing to show, and while it's
loading.

### 7.4 Settings / Profile

**Not designed yet — deliberately.**

This will be a nav tab. Tapping it should eventually give the user:

- Their **name** and **email**, and their currency/timezone
- **Log out**
- **Change password**
- **Manage accounts** — create new ones, manage existing ones
- **Manage categories** — create, and delete
- **Manage counterparties** — create, and delete

One rule I want baked in from the start: **you can only delete a category or a
counterparty if it has never been used.** If it's attached to a real transaction or a
real loan, deleting it would corrupt history — so the option is **deactivate** instead,
and it disappears from pickers without vanishing from old records. That distinction
(delete vs deactivate) will need to be clear in the UI whenever we build this.

I'm leaving this section thin on purpose — I'm not clear enough on it yet to spec it
properly, and I'd rather bring it to you separately than hand you something half-baked.

---

## 8. Errors, warnings, and the moments that matter

Getting these right is a big part of whether the app feels trustworthy or terrifying.

### 8.1 Warnings you can override

Some things aren't errors — they're *"are you sure?"*. The backend detects them and
sends them back as a **warning**, and the app shows it, offers to proceed anyway, and
if the user confirms, sends the same thing again with that warning explicitly
acknowledged.

Two exist today:

- **Insufficient balance** — you're trying to spend more than that account holds. The
  app warns; the user can say "yes, do it anyway" (because real life includes overdrafts,
  and refusing outright would make the app useless).
- **Repayment dated before the loan** — you're recording a repayment with a date earlier
  than the loan was issued. Possible, but usually a typo, so it's worth a check.

**One thing I want to fix:** right now these surface one at a time. If a transaction
triggers two warnings, the user confirms one, resubmits, and then gets the second. That's
a bad experience — **all warnings should be shown at once**, and one confirmation should
clear all of them.

### 8.2 Field errors

Validation errors should appear **inline, next to the field they belong to** — not as a
generic message at the top. If the server rejects something, that error belongs on the
specific field too.

### 8.3 Loading, empty, and error states

These exist throughout the app already and I'd like them kept and improved:

- **Loading** — skeleton placeholders in the shape of the content that's coming, not a
  spinner.
- **Refreshing** — a subtle inline "Refreshing…" when new data is coming in over
  existing content. Quiet, not disruptive.
- **Error** — an inline banner with a **Retry** action. When there's already content on
  screen, the banner is small and sits above it (don't destroy what the user is reading).
  When there's nothing on screen, it's a fuller centred state with a **Try again** button.
- **Empty** — friendly, and tells the user what to do next ("Add one with the + button
  below").

### 8.4 A fun note

I'd like the **success moments** to have some personality — saving a transaction, paying
off a loan. Paying off a loan completely is a genuine little life win and the app should
acknowledge it. Right now saving something just... closes the sheet. That's a missed
opportunity.

---

## 9. Adjusting a balance (something I need)

This is the one thing from my original list of gaps that's still outstanding, and I do
need it designed — please include it.

**The problem:** a balance can drift away from reality. A transaction gets missed, cash
gets miscounted, someone forgets to log something. Right now there's no honest way for a
user to correct an account's balance, which means once it's wrong it stays wrong — and
every number after it is wrong too.

**What I need:** a way for a user to **adjust an account's balance**. They'd pick the
account, then enter the amount they want the balance to *be*, and we'd settle the
difference on the backend.

**What the user should be told:** before they confirm, they should see a plain line of
text explaining what's about to happen — along the lines of *"An amount of ₦X will be
recorded as an adjustment expense for this account."* Just a simple note, so they
understand what's being recorded and aren't confused later when they spot an unfamiliar
entry in their history.

This isn't a big redesign — it's a small flow that needs a home.

---

*End of spec. Questions, disagreements, and better ideas are all welcome — especially
about the "fun" question in §2.2.*
