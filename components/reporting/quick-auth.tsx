'use client'

import { useState } from 'react'
import { ChevronRight, Loader2 } from 'lucide-react'
import { strings } from '@/lib/strings'
import type { Language, Member } from '@/lib/types'
import { supabase } from '@/lib/supabase'

interface QuickAuthProps {
  language: Language
  onSuccess: (member: Member) => void
  onCancel: () => void
}

export function QuickAuth({ language, onSuccess, onCancel }: QuickAuthProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const t = strings[language].reporting

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!email.trim()) {
      setErrors({ email: language === 'hi' ? 'ईमेल दर्ज करें' : 'Enter email' })
      return
    }
    if (!password) {
      setErrors({ password: language === 'hi' ? 'पासवर्ड दर्ज करें' : 'Enter password' })
      return
    }

    setLoading(true)

    // 1. Sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (authError) {
      setLoading(false)
      setErrors({
        form:
          language === 'hi'
            ? 'ईमेल या पासवर्ड गलत है। कृपया पुनः प्रयास करें।'
            : 'Invalid email or password. Please try again.',
      })
      return
    }

    const userId = authData.user?.id
    if (!userId) {
      setLoading(false)
      setErrors({ form: 'Login failed. Please try again.' })
      return
    }

    // 2. Fetch member profile
    const { data: memberRow, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', userId)
      .single()

    setLoading(false)

    if (memberError || !memberRow) {
      setErrors({
        form:
          language === 'hi'
            ? 'सदस्य प्रोफ़ाइल नहीं मिली। कृपया नए सदस्य के रूप में पंजीकरण करें।'
            : 'Member profile not found. Please register as a new member.',
      })
      return
    }

    const member: Member = {
      id: memberRow.id,
      phoneNumber: '',
      firstName: memberRow.first_name,
      lastName: memberRow.last_name,
      state: memberRow.state,
      district: memberRow.district,
      city: memberRow.city,
      memberCode: memberRow.member_code,
      email: memberRow.email,
      createdAt: new Date(memberRow.created_at),
    }

    onSuccess(member)
  }

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <h3 className="font-serif text-2xl font-normal text-primary">{t.quickAuth.heading}</h3>

      <div>
        <label className="block text-sm font-medium text-foreground/90 mb-1">
          {language === 'hi' ? 'ईमेल' : 'Email'}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrors({})
          }}
          className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none"
          placeholder="example@email.com"
          autoComplete="email"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground/90 mb-1">
          {language === 'hi' ? 'पासवर्ड' : 'Password'}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setErrors({})
          }}
          className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none"
          placeholder={language === 'hi' ? 'पासवर्ड' : 'Password'}
          autoComplete="current-password"
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>

      {errors.form && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-md border border-primary/30 px-4 py-2 font-serif text-foreground transition-colors hover:bg-secondary"
        >
          {t.buttons.cancel}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 font-serif text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {language === 'hi' ? 'लॉग इन हो रहा है…' : 'Logging in…'}
            </>
          ) : (
            <>
              {language === 'hi' ? 'लॉग इन करें' : 'Login'}
              <ChevronRight className="size-4" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
