'use client'

import { useState } from 'react'
import { AlertCircle, ArrowLeft, Check, Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound } from 'lucide-react'

type Mode = 'login' | 'signup' | 'forgot' | 'verify' | 'reset'
type Notice = { tone: 'error' | 'success'; text: string } | null

const inputClass = 'h-12 w-full rounded-2xl border border-border bg-card px-4 text-[15px] text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10'

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)

  function go(next: Mode) { setNotice(null); setMode(next) }
  function validPassword(value: string) { return /^\d{6}$/.test(value) }

  function submitLogin(event: React.FormEvent) {
    event.preventDefault()
    if (!username.trim() || !password) return setNotice({ tone: 'error', text: 'Enter your username and password.' })
    if (username.toLowerCase() === 'locked') return setNotice({ tone: 'error', text: 'Too many login attempts. Try again in 14 minutes.' })
    if (username.toLowerCase() !== 'demo' || password !== '123456') return setNotice({ tone: 'error', text: 'Those credentials do not match. Check them and try again.' })
    setNotice({ tone: 'success', text: 'Signed in successfully.' })
  }

  function submitSignup(event: React.FormEvent) {
    event.preventDefault()
    if (!username.trim()) return setNotice({ tone: 'error', text: 'Choose a username to continue.' })
    if (username.toLowerCase() === 'taken') return setNotice({ tone: 'error', text: 'That username is already taken. Try another one.' })
    if (!validPassword(password)) return setNotice({ tone: 'error', text: 'Your password must be exactly 6 digits.' })
    setNotice({ tone: 'success', text: 'Account details look good. Your account is ready.' })
  }

  function submitForgot(event: React.FormEvent) { event.preventDefault(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setNotice({ tone: 'error', text: 'Enter a valid email address.' }); setNotice(null); setMode('verify') }
  function submitVerify(event: React.FormEvent) { event.preventDefault(); if (code.toUpperCase() !== 'TW-4829') return setNotice({ tone: 'error', text: 'That code is invalid or expired. Check the message and try again.' }); setNotice(null); setMode('reset') }
  function submitReset(event: React.FormEvent) { event.preventDefault(); if (!validPassword(newPassword)) return setNotice({ tone: 'error', text: 'Your new password must be exactly 6 digits.' }); if (newPassword !== confirmPassword) return setNotice({ tone: 'error', text: 'The passwords do not match.' }); setNotice({ tone: 'success', text: 'Password updated. You can now sign in.' }); setTimeout(() => go('login'), 900) }

  const isPasswordMode = mode === 'login' || mode === 'signup'
  const title = mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : mode === 'forgot' ? 'Find your account' : mode === 'verify' ? 'Check your inbox' : 'Set a new password'
  const subtitle = mode === 'login' ? 'A quiet place for your money.' : mode === 'signup' ? 'Start keeping your financial life in view.' : mode === 'forgot' ? 'We’ll send a recovery code to your email.' : mode === 'verify' ? `Enter the code we sent to ${email}.` : 'Choose a new six-digit password.'

  return <main className="min-h-screen bg-background px-5 pb-8 pt-8 text-foreground sm:px-6"><div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-between gap-10"><div><div className="mb-10 flex items-center gap-2 text-primary"><span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="size-4" /></span><span className="text-sm font-semibold tracking-[0.18em]">TWOSIDE</span></div><div className="mb-7"><p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{mode === 'login' || mode === 'signup' ? 'Your account' : 'Account recovery'}</p><h1 className="text-balance text-3xl font-semibold tracking-tight">{title}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitle}</p></div>{notice && <div role="alert" className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm leading-5 ${notice.tone === 'error' ? 'border-destructive/30 bg-destructive/10 text-destructive' : 'border-primary/30 bg-primary/10 text-primary'}`}>{notice.tone === 'error' ? <AlertCircle className="mt-0.5 size-4 shrink-0" /> : <Check className="mt-0.5 size-4 shrink-0" />}<span>{notice.text}</span></div>}
      {isPasswordMode && <form onSubmit={mode === 'login' ? submitLogin : submitSignup} className="flex flex-col gap-4"><label className="flex flex-col gap-2"><span className="text-sm font-medium">Username</span><span className="relative"><UserRound className="pointer-events-none absolute left-4 top-3.5 size-4 text-muted-foreground" /><input className={`${inputClass} pl-11`} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your username" autoComplete="username" /></span></label><label className="flex flex-col gap-2"><span className="flex items-center justify-between text-sm font-medium"><span>Password</span>{mode === 'login' && <button type="button" onClick={() => go('forgot')} className="text-xs font-medium text-primary">Forgot password?</button>}</span><span className="relative"><LockKeyhole className="pointer-events-none absolute left-4 top-3.5 size-4 text-muted-foreground" /><input className={`${inputClass} pl-11 pr-11 tracking-[0.3em]`} value={password} onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6 digits" inputMode="numeric" maxLength={6} type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 rounded-lg p-1 text-muted-foreground"><span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span></label><button type="submit" className="mt-2 flex h-12 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[.99]">{mode === 'login' ? 'Sign in' : 'Create account'}</button></form>}
      {mode === 'forgot' && <form onSubmit={submitForgot} className="flex flex-col gap-4"><label className="flex flex-col gap-2"><span className="text-sm font-medium">Email address</span><span className="relative"><Mail className="pointer-events-none absolute left-4 top-3.5 size-4 text-muted-foreground" /><input className={`${inputClass} pl-11`} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" autoComplete="email" /></span></label><button type="submit" className="mt-2 h-12 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">Send recovery code</button></form>}
      {mode === 'verify' && <form onSubmit={submitVerify} className="flex flex-col gap-4"><label className="flex flex-col gap-2"><span className="text-sm font-medium">Recovery code</span><span className="relative"><KeyRound className="pointer-events-none absolute left-4 top-3.5 size-4 text-muted-foreground" /><input className={`${inputClass} pl-11 font-mono tracking-[0.2em] uppercase`} value={code} onChange={(e) => setCode(e.target.value.replace(/[^a-z0-9-]/gi, '').slice(0, 7).toUpperCase())} placeholder="TW-4829" autoComplete="one-time-code" /></span></label><button type="submit" className="mt-2 h-12 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">Verify code</button><button type="button" onClick={() => setMode('forgot')} className="text-sm text-muted-foreground">Use a different email</button></form>}
      {mode === 'reset' && <form onSubmit={submitReset} className="flex flex-col gap-4"><label className="flex flex-col gap-2"><span className="text-sm font-medium">New password</span><input className={`${inputClass} font-mono tracking-[0.3em]`} value={newPassword} onChange={(e) => setNewPassword(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6 digits" inputMode="numeric" maxLength={6} type="password" /></label><label className="flex flex-col gap-2"><span className="text-sm font-medium">Confirm password</span><input className={`${inputClass} font-mono tracking-[0.3em]`} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="repeat digits" inputMode="numeric" maxLength={6} type="password" /></label><button type="submit" className="mt-2 h-12 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">Update password</button></form>}</div><div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">{mode === 'login' ? <><span>New to twoside?</span><button type="button" onClick={() => go('signup')} className="font-semibold text-primary">Create an account</button></> : mode === 'signup' ? <><span>Already have an account?</span><button type="button" onClick={() => go('login')} className="font-semibold text-primary">Sign in</button></> : <button type="button" onClick={() => go('login')} className="inline-flex items-center gap-2 font-medium text-primary"><ArrowLeft className="size-4" />Back to sign in</button>}</div></div></main>
}
