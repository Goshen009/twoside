import type { Metadata } from 'next'
import AuthScreen from '@/components/auth/auth-screen'

export const metadata: Metadata = {
  title: 'Sign in — twoside',
  description: 'Sign in or create your twoside account.',
}

export default function AuthPage() {
  return <AuthScreen />
}
