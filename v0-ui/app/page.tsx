'use client'

import { useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  FolderOpen,
  Layers3,
  Menu,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react'

type View = 'Home' | 'Ledger' | 'Loans' | 'People' | 'Categories' | 'Manage'
type Action = 'Transfer' | 'Income' | 'Expense' | 'Lend' | 'Repay' | 'Borrow' | 'Adjust'

type Transaction = {
  date: string
  title: string
  detail: string
  amount: number
  kind: 'in' | 'out'
  category?: string
}

const navItems: { label: View; icon: typeof WalletCards }[] = [
  { label: 'Home', icon: WalletCards },
  { label: 'Ledger', icon: BookOpen },
  { label: 'Loans', icon: BriefcaseBusiness },
  { label: 'People', icon: UserRound },
  { label: 'Categories', icon: Layers3 },
  { label: 'Manage', icon: Settings2 },
]

const actions: { label: Action; icon: typeof ArrowUpRight }[] = [
  { label: 'Transfer', icon: ArrowUpRight },
  { label: 'Income', icon: ArrowDownLeft },
  { label: 'Expense', icon: ArrowUpRight },
  { label: 'Lend', icon: ArrowUpRight },
  { label: 'Repay', icon: ArrowDownLeft },
  { label: 'Borrow', icon: ArrowDownLeft },
  { label: 'Adjust', icon: SlidersHorizontal },
]

const transactions: Transaction[] = [
  { date: 'Today, 09:42', title: 'Salary', detail: 'Main account · Income', amount: 4200, kind: 'in', category: 'Work' },
  { date: 'Today, 08:16', title: 'Whole Foods Market', detail: 'Main account · Groceries', amount: 84.32, kind: 'out', category: 'Food' },
  { date: 'Yesterday, 18:30', title: 'Rent', detail: 'Main account · Housing', amount: 1450, kind: 'out', category: 'Housing' },
  { date: 'Yesterday, 12:05', title: 'Coffee Club', detail: 'Main account · Dining', amount: 6.5, kind: 'out', category: 'Food' },
  { date: 'Mon, Aug 24', title: 'Maya Chen', detail: 'Shared dinner · Transfer', amount: 42, kind: 'in' },
  { date: 'Sun, Aug 23', title: 'Internet service', detail: 'Main account · Bills', amount: 79.99, kind: 'out', category: 'Bills' },
]

const balances = [
  { name: 'Main account', value: 6824.21, note: 'USD · checking', tone: 'primary' },
  { name: 'Cash', value: 340, note: 'USD · wallet', tone: 'muted' },
  { name: 'Savings', value: 12050, note: 'USD · reserve', tone: 'muted' },
]

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(value))
}

function Amount({ value, kind, sign = true }: { value: number; kind: 'in' | 'out'; sign?: boolean }) {
  return <span className={kind === 'in' ? 'amount-in' : 'amount-out'}>{sign ? (kind === 'in' ? '+' : '−') : ''}{money(value)}</span>
}

function Header({ view, onMenu }: { view: View; onMenu: () => void }) {
  return (
    <header className="topbar">
      <button className="icon-button mobile-only" aria-label="Open navigation" onClick={onMenu}><Menu /></button>
      <div className="brand"><span className="brand-mark">T</span><span>twoside</span></div>
      <div className="header-title">{view}</div>
      <button className="icon-button" aria-label="Search"><Search /></button>
    </header>
  )
}

function BottomNav({ active, setActive }: { active: View; setActive: (view: View) => void }) {
  return <nav className="bottom-nav" aria-label="Primary navigation">{navItems.map(({ label, icon: Icon }) => <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => setActive(label)}><Icon /><span>{label}</span></button>)}</nav>
}

function HomeView() {
  const [action, setAction] = useState<Action>('Transfer')
  const [showForm, setShowForm] = useState(false)
  const [saved, setSaved] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  return <div className="view-stack">
    <section className="balance-grid">{balances.map((account) => <article className={`balance-card ${account.tone}`} key={account.name}><div className="eyebrow">{account.name}</div><strong>{money(account.value)}</strong><span>{account.note}</span></article>)}</section>
    <section className="section-block"><div className="section-heading"><div><span className="eyebrow">Quick entry</span><h2>What happened?</h2></div><button className="text-button" onClick={() => setShowForm(!showForm)}>{showForm ? 'Close' : 'New entry'} <Plus /></button></div>
      <div className="action-grid">{actions.map(({ label, icon: Icon }) => <button key={label} className={action === label ? 'action-button selected' : 'action-button'} onClick={() => { setAction(label); setShowForm(true) }}><Icon /><span>{label}</span></button>)}</div>
      {showForm && <TransactionForm action={action} saved={saved} onSave={() => { setSaved(true); setTimeout(() => setSaved(false), 1800) }} />}
    </section>
    <section className="section-block"><div className="section-heading"><div><span className="eyebrow">Recent activity</span><h2>Latest transactions</h2></div><button className="text-button" onClick={() => setExpanded(null)}>Clear</button></div><div className="transaction-list">{transactions.slice(0, 4).map((transaction, index) => <TransactionRow key={transaction.title} transaction={transaction} expanded={expanded === index} onClick={() => setExpanded(expanded === index ? null : index)} />)}</div></section>
  </div>
}

function TransactionForm({ action, saved, onSave }: { action: Action; saved: boolean; onSave: () => void }) {
  return <form className="entry-form" onSubmit={(event) => { event.preventDefault(); onSave() }}><div className="form-title"><span>{action}</span><span className="form-hint">{saved ? 'Saved to ledger' : 'required fields'}</span></div><label>Amount<input required type="number" min="0.01" step="0.01" placeholder="0.00" /></label><div className="form-row"><label>From<select defaultValue="main"><option value="main">Main account</option><option>Cash</option><option>Savings</option></select></label><label>To<select defaultValue="cash"><option value="cash">Cash</option><option>Main account</option><option>Savings</option></select></label></div><label>Note<input placeholder={action === 'Expense' ? 'What did you spend on?' : 'Optional note'} /></label><div className="form-footer"><span className="form-hint">Account balances update instantly.</span><button className="primary-button" type="submit">Save {action}</button></div></form>
}

function TransactionRow({ transaction, expanded, onClick }: { transaction: Transaction; expanded: boolean; onClick: () => void }) {
  return <button className="transaction-row" onClick={onClick}><div className="transaction-icon">{transaction.kind === 'in' ? <ArrowDownLeft /> : <ArrowUpRight />}</div><div className="transaction-copy"><strong>{transaction.title}</strong><span>{transaction.detail}</span><small>{transaction.date}</small>{expanded && <em>Reference: tws_{transaction.title.toLowerCase().replaceAll(' ', '_')}</em>}</div><div className="transaction-amount"><Amount value={transaction.amount} kind={transaction.kind} /><ChevronRight className={expanded ? 'rotate' : ''} /></div></button>
}

function LedgerView() {
  return <div className="view-stack"><section className="summary-strip"><div><span className="eyebrow">August 2026</span><strong><Amount value={3619.19} kind="in" /></strong><span>net movement</span></div><div><span className="eyebrow">Spent</span><strong className="amount-out">$1,620.81</strong><span>18 transactions</span></div></section><div className="filter-row"><button className="filter-button">All accounts <ChevronDown /></button><button className="filter-button">This month <ChevronDown /></button><button className="icon-button"><SlidersHorizontal /></button></div><section className="section-block"><div className="section-heading"><div><span className="eyebrow">Cursor feed</span><h2>All transactions</h2></div><span className="count-label">24 rows</span></div><div className="transaction-list">{transactions.concat(transactions.slice(1, 4)).map((item, index) => <TransactionRow key={`${item.title}-${index}`} transaction={item} expanded={false} onClick={() => {}} />)}</div><div className="loading-line">Loading more records...</div></section></div>
}

function LoansView() {
  const loans = [{ name: 'Jordan Williams', balance: 250, type: 'You lent', status: 'Due Sep 03' }, { name: 'Alex Morgan', balance: 120, type: 'You borrowed', status: 'Due Sep 12' }, { name: 'Sam Patel', balance: 680, type: 'You lent', status: 'No due date' }]
  return <div className="view-stack"><section className="summary-strip"><div><span className="eyebrow">Outstanding</span><strong>$1,050.00</strong><span>across 3 people</span></div><div><span className="eyebrow">Net position</span><strong className="amount-in">+$810.00</strong><span>in your favor</span></div></section><div className="filter-row"><button className="filter-button">All loans <ChevronDown /></button><button className="text-button"><Plus /> Add loan</button></div><section className="section-block"><div className="section-heading"><div><span className="eyebrow">Open balances</span><h2>People owing</h2></div></div><div className="loan-list">{loans.map((loan) => <button className="loan-row" key={loan.name}><div className="avatar">{loan.name.split(' ').map((word) => word[0]).join('')}</div><div className="transaction-copy"><strong>{loan.name}</strong><span>{loan.type} · {loan.status}</span></div><div className="loan-amount">{money(loan.balance)}<ChevronRight /></div></button>)}</div></section></div>
}

function PeopleView() {
  const people = [{ name: 'Jordan Williams', detail: '1 open loan', amount: '$250.00' }, { name: 'Alex Morgan', detail: '1 open loan', amount: '$120.00' }, { name: 'Sam Patel', detail: '1 open loan', amount: '$680.00' }, { name: 'Maya Chen', detail: 'Settled', amount: '$0.00' }]
  return <div className="view-stack"><div className="search-field"><Search /><input placeholder="Search people" /></div><section className="section-block"><div className="section-heading"><div><span className="eyebrow">Counterparties</span><h2>Your people</h2></div><button className="icon-button"><Plus /></button></div><div className="loan-list">{people.map((person) => <button className="loan-row" key={person.name}><div className="avatar">{person.name.split(' ').map((word) => word[0]).join('')}</div><div className="transaction-copy"><strong>{person.name}</strong><span>{person.detail}</span></div><div className="loan-amount">{person.amount}<ChevronRight /></div></button>)}</div></section></div>
}

function CategoriesView() {
  const categories = [{ name: 'Housing', total: '$1,450.00', count: 1 }, { name: 'Food', total: '$90.82', count: 2 }, { name: 'Bills', total: '$79.99', count: 1 }, { name: 'Work', total: '$4,200.00', count: 1 }]
  return <div className="view-stack"><div className="filter-row"><button className="filter-button">August 2026 <ChevronDown /></button><button className="filter-button">All accounts <ChevronDown /></button></div><section className="section-block"><div className="section-heading"><div><span className="eyebrow">Spend by category</span><h2>This month</h2></div><button className="icon-button"><Plus /></button></div><div className="category-list">{categories.map((category) => <div className="category-row" key={category.name}><div className="category-dot" /><div className="transaction-copy"><strong>{category.name}</strong><span>{category.count} transaction{category.count === 1 ? '' : 's'}</span></div><strong>{category.total}</strong><ChevronRight /></div>)}</div></section></div>
}

function ManageView() {
  return <div className="view-stack"><section className="section-block"><div className="section-heading"><div><span className="eyebrow">Configuration</span><h2>Manage workspace</h2></div></div><div className="manage-list">{[['Accounts', '3 active accounts', CreditCard], ['Categories', '4 categories', FolderOpen], ['Currencies', 'USD · US Dollar', CircleDollarSign], ['Warnings', 'Confirm risky entries', SlidersHorizontal]].map(([title, detail, Icon]) => <button className="manage-row" key={title as string}><Icon /><div className="transaction-copy"><strong>{title as string}</strong><span>{detail as string}</span></div><ChevronRight /></button>)}</div></section><section className="section-block"><div className="section-heading"><div><span className="eyebrow">Data</span><h2>Import & export</h2></div></div><button className="wide-button">Export ledger <ArrowUpRight /></button><button className="wide-button">Import transactions <ArrowDownLeft /></button></section></div>
}

export default function Page() {
  const [view, setView] = useState<View>('Home')
  const [menuOpen, setMenuOpen] = useState(false)
  const content = useMemo(() => ({ Home: <HomeView />, Ledger: <LedgerView />, Loans: <LoansView />, People: <PeopleView />, Categories: <CategoriesView />, Manage: <ManageView /> })[view], [view])
  return <main className="app-shell"><Header view={view} onMenu={() => setMenuOpen(true)} /><div className={menuOpen ? 'side-menu open' : 'side-menu'}><div className="menu-header"><span className="brand"><span className="brand-mark">T</span>twoside</span><button className="icon-button" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X /></button></div>{navItems.map(({ label, icon: Icon }) => <button className={view === label ? 'side-item active' : 'side-item'} key={label} onClick={() => { setView(label); setMenuOpen(false) }}><Icon />{label}</button>)}</div><div className="page-content">{content}</div><BottomNav active={view} setActive={setView} /></main>
}
