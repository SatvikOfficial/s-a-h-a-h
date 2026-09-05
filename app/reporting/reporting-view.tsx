'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Globe, Loader2 } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { RegistrationForm } from '@/components/reporting/registration-form'
import { QuickAuth } from '@/components/reporting/quick-auth'
import { ReportForm } from '@/components/reporting/report-form'
import { strings } from '@/lib/strings'
import { supabase } from '@/lib/supabase'
import type { Language, Member } from '@/lib/types'
import { toMember } from '@/lib/types'

type Stage = 'auth' | 'form' | 'success'
type AuthTab = 'new' | 'returning'

export function ReportingView() {
  const [language, setLanguage] = useState<Language>('hi')
  const [stage, setStage] = useState<Stage>('auth')
  const [authTab, setAuthTab] = useState<AuthTab>('new')
  const [currentMember, setCurrentMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore Supabase auth session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        // Fetch the member profile for this authenticated user
        const { data: memberRow } = await supabase
          .from('members')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (memberRow) {
          setCurrentMember(toMember(memberRow))
          setStage('form')
        }
      }
      setIsLoading(false)
    }

    restoreSession()
  }, [])

  const t = strings[language].reporting

  const handleMemberCreated = (member: Member) => {
    setCurrentMember(member)
    setStage('form')
  }

  const handleReportSubmitted = () => {
    setStage('success')
  }

  const handleReset = async () => {
    await supabase.auth.signOut()
    setStage('auth')
    setAuthTab('new')
    setCurrentMember(null)
  }

  if (isLoading) {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen bg-gradient-to-b from-background to-secondary parchment-texture flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary/60" />
        </main>
        <SiteFooter />
      </>
    )
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary parchment-texture">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          {/* Header with language toggle */}
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-serif text-4xl font-normal text-primary sm:text-5xl">{t.title}</h1>
              <p className="mt-2 text-foreground/70">{t.subtitle}</p>
            </div>
            <button
              onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
              className="flex items-center gap-2 rounded-md border border-primary/30 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-secondary whitespace-nowrap"
              aria-label={language === 'hi' ? 'भाषा बदलें (Switch to English)' : 'Change Language (हिंदी में बदलें)'}
              title={language === 'hi' ? 'भाषा बदलें' : 'Change Language'}
            >
              <Globe className="size-4 flex-shrink-0" />
              <span>{language === 'hi' ? 'भाषा बदलें / Change Language' : 'भाषा बदलें / Change Language'}</span>
            </button>
          </div>

          {/* Main content */}
          <div className="rounded-lg border border-gold/30 bg-background/50 p-6 sm:p-8 backdrop-blur">
            {stage === 'auth' && (
              <>
                {/* Auth tabs */}
                <div className="mb-8 flex gap-4 border-b border-gold/20">
                  <button
                    onClick={() => setAuthTab('new')}
                    className={`px-4 py-2 font-serif text-lg transition-colors ${
                      authTab === 'new'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-foreground/60 hover:text-foreground'
                    }`}
                  >
                    {t.tabs.newMember}
                  </button>
                  <button
                    onClick={() => setAuthTab('returning')}
                    className={`px-4 py-2 font-serif text-lg transition-colors ${
                      authTab === 'returning'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-foreground/60 hover:text-foreground'
                    }`}
                  >
                    {t.tabs.returningMember}
                  </button>
                </div>

                {authTab === 'new' ? (
                  <RegistrationForm
                    language={language}
                    onSuccess={handleMemberCreated}
                    onCancel={() => {}}
                  />
                ) : (
                  <QuickAuth
                    language={language}
                    onSuccess={handleMemberCreated}
                    onCancel={() => {}}
                  />
                )}
              </>
            )}

            {stage === 'form' && currentMember && (
              <ReportForm
                language={language}
                member={currentMember}
                onSuccess={handleReportSubmitted}
                onCancel={handleReset}
              />
            )}

            {stage === 'success' && (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary/10 p-6">
                    <div className="text-6xl">✓</div>
                  </div>
                </div>
                <div>
                  <h2 className="font-serif text-3xl font-normal text-primary">
                    {language === 'hi'
                      ? 'आपकी रिपोर्ट सफलतापूर्वक जमा की गई है।'
                      : 'Your report has been successfully submitted.'}
                  </h2>
                  <p className="mt-4 text-foreground/70">
                    {language === 'hi'
                      ? 'S.A.H.A.S. टीम आपकी रिपोर्ट की समीक्षा करेगी और आवश्यक कार्रवाई करेगी।'
                      : 'The S.A.H.A.S. team will review your report and take necessary action.'}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    onClick={() => setStage('form')}
                    className="rounded-md border border-primary/40 px-8 py-3 font-serif text-primary transition-all hover:bg-secondary"
                  >
                    {language === 'hi' ? 'और रिपोर्ट करें' : 'File Another Report'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="rounded-md bg-primary px-8 py-3 font-serif text-primary-foreground transition-all hover:bg-primary/90"
                  >
                    {language === 'hi' ? 'लॉग आउट करें' : 'Sign Out'}
                  </button>
                </div>
                <Link href="/" className="block text-center text-sm text-primary hover:underline">
                  {language === 'hi' ? 'मुख्य पृष्ठ पर जाएं' : 'Go to Home'}
                </Link>
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:p-6">
            <p className="text-sm text-foreground/80">
              {language === 'hi'
                ? '💡 आपकी जानकारी पूरी तरह से सुरक्षित है। S.A.H.A.S. केवल आपकी जानकारी का उपयोग धर्म की रक्षा के लिए करेगा।'
                : '💡 Your information is completely secure. S.A.H.A.S. will use your information only to protect Dharma.'}
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
