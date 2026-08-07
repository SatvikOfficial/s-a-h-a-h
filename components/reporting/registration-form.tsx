'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { strings } from '@/lib/strings'
import { indianLocations, indianLocationsEn } from '@/lib/locations'
import type { Language, Member } from '@/lib/types'
import { supabase } from '@/lib/supabase'

interface RegistrationFormProps {
  language: Language
  onSuccess: (member: Member) => void
  onCancel: () => void
}

type Step = 'form' | 'confirm_email' | 'success'

export function RegistrationForm({ language, onSuccess, onCancel }: RegistrationFormProps) {
  const [step, setStep] = useState<Step>('form')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [state, setState] = useState('')
  const [district, setDistrict] = useState('')
  const [city, setCity] = useState('')
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
    if (!lastName.trim()) newErrors.lastName = t.errors.required
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = language === 'hi' ? 'वैध ईमेल दर्ज करें' : 'Enter a valid email'
    if (password.length < 6)
      newErrors.password = language === 'hi' ? 'कम से कम 6 अक्षर' : 'At least 6 characters'
    if (password !== confirmPassword)
      newErrors.confirmPassword = language === 'hi' ? 'पासवर्ड मेल नहीं खाते' : 'Passwords do not match'
    if (!state) newErrors.state = t.errors.selectState
    if (!district) newErrors.district = t.errors.selectDistrict
    if (!city.trim()) newErrors.city = t.errors.required

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
      },
    })

    if (authError) {
      setLoading(false)
      if (authError.message.toLowerCase().includes('already registered')) {
        setErrors({ email: language === 'hi' ? 'यह ईमेल पहले से पंजीकृत है' : 'Email already registered. Please login instead.' })
      } else {
        setErrors({ form: authError.message })
      }
      return
    }

    const userId = authData.user?.id
    if (!userId) {
      setLoading(false)
      setErrors({ form: 'Registration failed. Please try again.' })
      return
    }

    // If email confirmation is required, session will be null — show confirm-email step
    if (!authData.session) {
      setLoading(false)
      setStep('confirm_email')
      return
    }

    // 2. Insert member profile row
    const { data: memberRow, error: memberError } = await supabase
      .from('members')
      .insert({
        user_id: userId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        state,
        district,
        city: city.trim(),
      })
      .select()
      .single()

    setLoading(false)

    if (memberError) {
      console.error('Member insert error:', memberError)
      setErrors({ form: language === 'hi' ? 'प्रोफ़ाइल सहेजने में त्रुटि' : 'Error saving profile' })
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

    setCreatedMember(member)
    setStep('success')
    onSuccess(member)
  }

  if (step === 'form') {
    return (
      <form onSubmit={handleSubmitForm} className="space-y-6">
        <h3 className="font-serif text-2xl font-normal text-primary">{t.registration.heading}</h3>

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
              placeholder={language === 'hi' ? 'अंतिम नाम' : 'Last name'}
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/90 mb-1">
            {language === 'hi' ? 'ईमेल' : 'Email'}
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-1">
              {language === 'hi' ? 'पासवर्ड' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none"
              placeholder={language === 'hi' ? 'न्यूनतम 6 अक्षर' : 'Min. 6 characters'}
              autoComplete="new-password"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-1">
              {language === 'hi' ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none"
              placeholder={language === 'hi' ? 'पुनः दर्ज करें' : 'Re-enter'}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
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
                {language === 'hi' ? 'पंजीकरण हो रहा है…' : 'Registering…'}
              </>
            ) : (
              <>
                {language === 'hi' ? 'पंजीकरण करें' : 'Register'}
                <ChevronRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </form>
    )
  }

  // confirm_email state
  if (step === 'confirm_email') {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <svg
              className="size-12 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
        <div>
          <h3 className="font-serif text-2xl font-normal text-primary">
            {language === 'hi' ? 'ईमेल की पुष्टि करें' : 'Confirm Your Email'}
          </h3>
          <p className="mt-4 text-sm text-foreground/70">
            {language === 'hi'
              ? 'हमने आपके ईमेल पते पर एक पुष्टिकरण लिंक भेजा है। कृपया अपना इनबॉक्स जांचें और लिंक पर क्लिक करें।'
              : 'We have sent a confirmation link to your email address. Please check your inbox and click the link.'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="w-full rounded-md border border-primary/30 px-4 py-2 font-serif text-foreground transition-colors hover:bg-secondary"
        >
          {language === 'hi' ? 'लॉग इन पर वापस जाएं' : 'Back to Login'}
        </button>
      </div>
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
