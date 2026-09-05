'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { strings } from '@/lib/strings'
import { indianLocations, indianLocationsEn } from '@/lib/locations'
import type { Language, Member } from '@/lib/types'
import { toMember } from '@/lib/types'
import { supabase } from '@/lib/supabase'

interface RegistrationFormProps {
  language: Language
  onSuccess: (member: Member) => void
  onCancel: () => void
}

type Step = 'form' | 'otp' | 'success'

export function RegistrationForm({ language, onSuccess, onCancel }: RegistrationFormProps) {
  const [step, setStep] = useState<Step>('form')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [state, setState] = useState('')
  const [district, setDistrict] = useState('')
  const [city, setCity] = useState('')
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [createdMember, setCreatedMember] = useState<Member | null>(null)

  const t = strings[language].reporting

  const locations = language === 'hi' ? indianLocations : indianLocationsEn
  const states = Object.keys(locations)
  const districts = state ? locations[state] || [] : []

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!firstName.trim()) newErrors.firstName = t.errors.required
    // Phone is required for OTP verification (reporting requires verification)
    if (!phone.trim() || !/^[0-9+\-\s]{7,15}$/.test(phone.trim()))
      newErrors.phone = t.errors.invalidPhone

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    // Send one-time OTP to the phone number for verification
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: phone.trim(),
      options: { shouldCreateUser: true },
    })

    setLoading(false)

    if (otpError) {
      setErrors({ form: otpError.message })
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
      setErrors({ otp: 'Verification failed. Please try again.' })
      return
    }

    // Insert member profile row (optional fields default to empty)
    const { data: memberRow, error: memberError } = await supabase
      .from('members')
      .insert({
        user_id: userId,
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        email: email.trim().toLowerCase() || null,
        phone: phone.trim(),
        state: state || null,
        district: district || null,
        city: city.trim() || null,
      })
      .select()
      .single()

    setLoading(false)

    if (memberError) {
      console.error('Member insert error:', memberError)
      setErrors({ otp: language === 'hi' ? 'प्रोफ़ाइल सहेजने में त्रुटि' : 'Error saving profile' })
      return
    }

    const member = toMember(memberRow)

    setCreatedMember(member)
    setStep('success')
    onSuccess(member)
  }

  const handleResend = async () => {
    setOtp('')
    setErrors({})
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone.trim(),
      options: { shouldCreateUser: true },
    })
    setLoading(false)
    if (error) setErrors({ otp: error.message })
  }

  if (step === 'form') {
    return (
      <form onSubmit={handleSubmitForm} className="space-y-6">
        <h3 className="font-serif text-2xl font-normal text-primary">{t.registration.heading}</h3>

        <p className="text-sm text-foreground/70">
          {language === 'hi'
            ? 'ईमेल, फोन और स्थान की जानकारी वैकल्पिक है। घुसपैठिया रिपोर्ट करने के लिए OTP सत्यापन आवश्यक है।'
            : 'Email, phone and location are optional. OTP verification is required to report an intruder.'}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-1">
              {t.registration.firstName}
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none"
              placeholder={language === 'hi' ? 'नाम' : 'Name'}
            />
            {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-1">
              {t.registration.lastName}
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none"
              placeholder={language === 'hi' ? 'अंतिम नाम (वैकल्पिक)' : 'Last name (optional)'}
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/90 mb-1">
            {language === 'hi' ? 'फोन नंबर (आवश्यक)' : 'Phone Number (required)'}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none"
            placeholder="+91 90000 00000"
            autoComplete="tel"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/90 mb-1">
            {language === 'hi' ? 'ईमेल (वैकल्पिक)' : 'Email (optional)'}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none"
            placeholder="example@email.com"
            autoComplete="email"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-1">
              {t.registration.state}
            </label>
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value)
                setDistrict('')
                setCity('')
              }}
              className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none"
            >
              <option value="">{t.registration.selectState}</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-1">
              {t.registration.district}
            </label>
            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value)
                setCity('')
              }}
              disabled={!state}
              className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none disabled:opacity-50"
            >
              <option value="">{t.registration.selectDistrict}</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-1">
              {t.registration.city}
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!district}
              className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none disabled:opacity-50"
              placeholder={language === 'hi' ? 'शहर' : 'City'}
            />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
          </div>
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

  if (step === 'otp') {
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
            {language === 'hi' ? 'OTP दर्ज करें' : 'Enter OTP'}
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
            onClick={() => setStep('form')}
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

  // success state
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-primary/10 p-4">
          <div className="text-4xl">✓</div>
        </div>
      </div>
      <div>
        <h3 className="font-serif text-2xl font-normal text-primary">{t.success.memberCreated}</h3>
        <div className="mt-4 rounded-md bg-secondary p-4">
          <p className="text-sm text-foreground/70">{t.success.memberId}</p>
          <p className="font-serif text-xl font-semibold text-primary">
            {createdMember?.memberCode ?? ''}
          </p>
        </div>
        <p className="mt-4 text-sm text-foreground/70">{t.success.shareMessage}</p>
      </div>
      <button
        onClick={onCancel}
        className="w-full rounded-md bg-primary px-4 py-2 font-serif text-primary-foreground transition-all hover:bg-primary/90"
      >
        {t.buttons.next}
      </button>
    </div>
  )
}
