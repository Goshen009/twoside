'use client'

import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Home, Landmark, Plus, ReceiptText, UserRound, WalletCards } from 'lucide-react'

type Screen = 'home' | 'ledger' | 'add' | 'budgets' | 'profile'

type Loan = { date: string; name: string; total: number; remaining: number }

const accounts = [
  { name: 'Cash account', balance: 1240.5, detail: 'Active' },
  { name: 'Main bank', balance: 8420.18, detail: 'Active' },
  { name: 'Savings account', balance: 3200, detail: 'Active' },
  { name: 'Old bank account', balance: 0, detail: 'Disabled' },
]

const loans: Record<'Owed to you' | 'You owe', Loan[]> = {
  'Owed to you': [
    { date: '12 Jun 2025', name: 'Jordan Williams', total: 1200, remaining: 800 },
    { date: '03 May 2025', name: 'Maya Chen', total: 350, remaining: 350 },
  ],
  'You owe': [{ date: '28 Apr 2025', name: 'Alex Morgan', total: 900, remaining: 400 }],
}

export default function HomeScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [tab, setTab] = useState<'Owed to you' | 'You owe'>('Owed to you')
  return <div className="min-h-screen bg-background pb-24 text-foreground"><main className="mx-auto w-full max-w-lg px-4 pb-6 pt-5">
    <section><div className="mb-3 flex items-center gap-2"><WalletCards className="size-4 text-primary" /><h1 className="text-lg font-semibold">Accounts</h1></div><div className="flex flex-col gap-2">{accounts.map((account) => <article key={account.name} className={`flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm ${account.detail === 'Disabled' ? 'opacity-55' : ''}`}><div className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground"><WalletCards className="size-4" /></span><div className="min-w-0"><p className="truncate text-sm font-medium">{account.name}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{account.detail}</p></div></div><span className="text-sm font-semibold tabular-nums">${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></article>)}</div></section>
    <section className="mt-7"><div className="mb-3 flex items-center gap-2"><ArrowUpRight className="size-4 text-primary" /><h2 className="text-lg font-semibold">Loans</h2></div><div className="rounded-2xl border border-border bg-card p-1 shadow-sm"><div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1">{(['Owed to you', 'You owe'] as const).map((item) => <button type="button" key={item} onClick={() => setTab(item)} className={`rounded-lg py-2 text-sm font-medium transition ${tab === item ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>{item}</button>)}</div><div className="flex flex-col gap-2 p-2">{loans[tab].map((loan) => <article key={`${loan.date}-${loan.name}`} className="rounded-xl border border-border bg-background px-3.5 py-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium">{loan.name}</p><p className="mt-1 text-[11px] text-muted-foreground">{loan.date}</p></div><span className="text-sm font-semibold tabular-nums">${loan.remaining.toFixed(2)} left</span></div><div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-xs"><span className="text-muted-foreground">Total</span><span className="tabular-nums">${loan.total.toFixed(2)}</span></div></article>)}</div></div></section>
  </main><nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur"><div className="mx-auto flex max-w-lg items-center justify-around"><NavItem icon={Home} label="Home" active /><NavItem icon={Landmark} label="Ledger" onClick={() => onNavigate('ledger')} /><NavItem icon={Plus} label="Add" onClick={() => onNavigate('add')} /><NavItem icon={ReceiptText} label="Budgets" onClick={() => onNavigate('budgets')} /><NavItem icon={UserRound} label="Profile" onClick={() => onNavigate('profile')} /></div></nav></div>
}

function NavItem({ icon: Icon, label, active = false, onClick }: { icon: typeof Home; label: string; active?: boolean; onClick?: () => void }) { return <button type="button" onClick={onClick} className={`flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] ${active ? 'text-primary' : 'text-muted-foreground'}`} aria-current={active ? 'page' : undefined}><span className={`flex size-8 items-center justify-center rounded-xl ${active ? 'bg-primary/10' : ''}`}><Icon aria-hidden="true" className="size-4" /></span>{label}</button> }
