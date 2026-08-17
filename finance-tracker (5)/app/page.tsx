'use client'

import { useState } from 'react'
import BudgetsScreen from '@/components/finance/budgets-screen'
import HomeScreen from '@/components/finance/home-screen'
import LedgerScreen from '@/components/finance/ledger-screen'
import ProfileScreen from '@/components/finance/profile-screen'
import QuickLogScreen from '@/components/finance/quick-log-screen'
import TransactionBuilder from '@/components/finance/transaction-builder'

type Screen = 'home' | 'ledger' | 'add' | 'budgets' | 'profile' | 'quick-log'

export default function Page() {
  const [screen, setScreen] = useState<Screen>('add')
  if (screen === 'home') return <HomeScreen onNavigate={setScreen} />
  if (screen === 'profile') return <ProfileScreen onNavigate={setScreen} />
  if (screen === 'quick-log') return <QuickLogScreen onNavigate={setScreen} />
  if (screen === 'ledger') return <LedgerScreen onNavigate={setScreen} />
  if (screen === 'budgets') return <BudgetsScreen onNavigate={setScreen} />
  return <TransactionBuilder onNavigate={setScreen} />
}
