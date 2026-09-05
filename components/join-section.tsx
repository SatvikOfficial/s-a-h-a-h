'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/section-heading'
import { supabase } from '@/lib/supabase'

type MemberForm = {
  name: string
  mobile: string
  email: string
  city: string
  consent: boolean
}

const empty: MemberForm = {
  name: '',
  mobile: '',
  email: '',
  city: '',
  consent: false,
}

export function JoinSection() {
  const [form, setForm] = useState<MemberForm>(empty)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof MemberForm>(key: K, value: MemberForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: dbError } = await supabase.from('join_requests').insert({
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim() || null,
      city: form.city.trim(),
    })

    setLoading(false)

    if (dbError) {
      console.error('Join request error:', dbError)
      setError('कुछ त्रुटि हुई। कृपया पुनः प्रयास करें।')
      return
    }

    setSubmitted(true)
  }

  return (
    <section id="join" className="border-b border-gold/20 py-16 sm:py-24">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <SectionHeading
          title="S.A.H.A.S. से जुड़ें"
          subtitle="संगठन से जुड़ने हेतु अपनी जानकारी साझा करें। हम शीघ्र आपसे संपर्क करेंगे।"
        />

        <div className="mt-10 rounded-lg border border-gold/30 bg-card p-6 shadow-sm sm:p-8">
          {submitted ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle2 className="size-12 text-accent" aria-hidden="true" />
              <p className="mt-4 font-serif text-xl text-primary">धन्यवाद!</p>
              <p className="mt-2 font-serif text-foreground/80">
                आपकी रुचि दर्ज कर ली गई है। S.A.H.A.S. परिवार में आपका स्वागत है।
              </p>
              <Button
                variant="outline"
                className="mt-6 border-primary/40 bg-transparent font-serif text-primary hover:bg-secondary"
                onClick={() => {
                  setForm(empty)
                  setSubmitted(false)
                }}
              >
                नया फ़ॉर्म भरें
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field
                id="name"
                label="नाम"
                required
                value={form.name}
                onChange={(v) => update('name', v)}
                autoComplete="name"
              />
              <Field
                id="mobile"
                label="मोबाइल नंबर (वैकल्पिक)"
                type="tel"
                inputMode="numeric"
                value={form.mobile}
                onChange={(v) => update('mobile', v)}
                autoComplete="tel"
              />
              <Field
                id="email"
                label="ईमेल (वैकल्पिक)"
                type="email"
                value={form.email}
                onChange={(v) => update('email', v)}
                autoComplete="email"
              />
              <Field
                id="city"
                label="शहर (वैकल्पिक)"
                value={form.city}
                onChange={(v) => update('city', v)}
                autoComplete="address-level2"
              />

              <label className="flex items-start gap-3 font-serif text-sm text-foreground/80">
                <input
                  type="checkbox"
                  required
                  checked={form.consent}
                  onChange={(e) => update('consent', e.target.checked)}
                  className="mt-1 size-4 accent-[oklch(0.41_0.13_25)]"
                />
                <span>मैं S.A.H.A.S. से जुड़ना चाहता/चाहती हूँ।</span>
              </label>

              {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full bg-primary font-serif text-base tracking-wide text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    जमा हो रहा है…
                  </span>
                ) : (
                  'जुड़ें'
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  inputMode,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  inputMode?: 'numeric' | 'text'
  autoComplete?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-serif text-sm text-foreground/80">
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-input bg-background px-3 py-2.5 font-sans text-base text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )
}
