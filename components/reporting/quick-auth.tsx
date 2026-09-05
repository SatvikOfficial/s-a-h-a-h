'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { strings } from '@/lib/strings'
import type { Language, Member } from '@/lib/types'
import { supabase } from '@/lib/supabase'

interface QuickAuthProps {
  language: Language
  onSuccess: (member: Member) => void
  onCancel: () => void
}

type Step = 'phone' | 'otp'

export function QuickAuth({ language, onSuccess, onCancel }: QuickAuthProps) {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const t = strings[language].reporting

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!phone.trim() || !/^[0-9+\-\s]{7,15}$/.test(phone.trim())) {
      setErrors({ phone: t.errors.invalidPhone })
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      phone: phone.trim(),
      options: { shouldCreateUser: false },
    })

    setLoading(false)

    if (error) {
      setErrors({ phone: error.message })
      return
    }

    setStep('otp')
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp.trim()) {
      setErrors({ otp: t.errors.invalidOtp })
      return
    }

    setLoading(true)

    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: otp.trim(),
      type: 'sms',
    })

    if (authError) {
      setLoading(false)
      setErrors({ otp: authError.message })
      return
    }

    const userId = authData.user?.id
    if (!userId) {
      setLoading(false)
      setErrors({ otp: 'Login failed. Please try again.' })
      return
    }

    // Fetch member profile
    const { data: memberRow, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', userId)
      .single()

    setLoading(false)

    if (memberError || !memberRow) {
      setErrors({
        otp:
          language === 'hi'
            ? 'सदस्य प्रोफ़ाइल नहीं मिली। कृपया नए सदस्य के रूप में पंजीकरण करें।'
            : 'Member profile not found. Please register as a new member.',
      })
      return
    }

    const member: Member = {
      id: memberRow.id,
      phoneNumber: memberRow.phone ?? memberRow.phoneNumber ?? '',
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

  const handleResend = async () => {
    setOtp('')
    setErrors({})
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone.trim(),
      options: { shouldCreateUser: false },
    })
    setLoading(false)
    if (error) setErrors({ phone: error.message })
  }

  if (step === 'phone') {
    return (
      <form onSubmit={handleSendOtp} className="space-y-6">
        <h3 className="font-serif text-2xl font-normal text-primary">{t.quickAuth.heading}</h3>

        <div>
          <label className="block text-sm font-medium text-foreground/90 mb-1">
            {t.quickAuth.phoneNumber}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              setErrors({})
            }}
            className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none"
            placeholder="+91 90000 00000"
            autoComplete="tel"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
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
                {language === 'hi' ? 'OTP भेजा जा रहा है…' : 'Sending OTP…'}
              </>
            ) : (
              <>
                {language === 'hi' ? 'OTP भेजें' : 'Send OTP'}
                <ChevronRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleVerifyOtp} className="space-y-6">
      <h3 className="font-serif text-2xl font-normal text-primary">
        {language === 'hi' ? 'OTP सत्यापित करें' : 'Verify OTP'}
      </h3>
      <p className="text-sm text-foreground/70">
        {language === 'hi'
          ? `हमने ${phone} पर एक बार उपयोग होने वाला OTP भेजा है।`
          : `We have sent a one-time OTP to ${phone}.`}
      </p>

      <div>
        <label className="block text-sm font-medium text-foreground/90 mb-1">
          {t.quickAuth.enterOtp}
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value.replace(/\D/g, ''))
            setErrors({})
          }}
          className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-center font-serif text-2xl tracking-[0.4em] text-foreground transition-colors focus:border-primary focus:outline-none"
          placeholder="••••••"
          maxLength={6}
          autoComplete="one-time-code"
        />
        {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => setStep('phone')}
          disabled={loading}
          className="flex-1 rounded-md border border-primary/30 px-4 py-2 font-serif text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-2">
            <ChevronLeft className="size-4" />
            {language === 'hi' ? 'वापस' : 'Back'}
          </span>
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 font-serif text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {language === 'hi' ? 'सत्यापित हो रहा है…' : 'Verifying…'}
            </>
          ) : (
            <>
              {language === 'hi' ? 'सत्यापित करें' : 'Verify'}
              <ChevronRight className="size-4" />
            </>
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={handleResend}
        disabled={loading}
        className="text-center text-sm text-primary hover:underline disabled:opacity-60"
      >
        {language === 'hi' ? 'OTP फिर से भेजें' : 'Resend OTP'}
      </button>
    </form>
  )
}
