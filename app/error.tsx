'use client'

import { useEffect } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary parchment-texture flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg border border-gold/30 bg-background/50 p-8 text-center backdrop-blur">
          <p className="font-serif text-6xl font-normal text-primary">!</p>
          <h1 className="mt-4 font-serif text-2xl font-normal text-primary">
            कुछ गलत हो गया
          </h1>
          <p className="mt-3 text-foreground/70">
            पृष्ठ लोड करते समय एक त्रुटि हुई। कृपया पुनः प्रयास करें।
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={reset}
              aria-label="पुनः प्रयास करें"
              className="w-full rounded-md bg-primary px-4 py-2 font-serif text-primary-foreground transition-all hover:bg-primary/90"
            >
              पुनः प्रयास करें
            </button>
            <a
              href="/"
              className="w-full rounded-md border border-primary/40 px-4 py-2 font-serif text-primary transition-all hover:bg-secondary"
            >
              मुख्य पृष्ठ पर जाएं
            </a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
