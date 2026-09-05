'use client'

import { useEffect, useState } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Loader2, ExternalLink, ChevronRight, RefreshCw } from 'lucide-react'

interface NewsArticle {
  title: string
  description: string
  url: string
  urlToImage: string | null
  source: { name: string }
  publishedAt: string
}

// Text cards carry a coloured accent bar instead of a (fake) image. The palette
// rotates so a long text run doesn't read as a dead zone.
const ACCENT_TONES = [
  'from-gold/80 via-primary/80 to-gold/80',
  'from-emerald-500 via-teal-400 to-emerald-500',
  'from-rose-400 via-orange-300 to-rose-400',
  'from-sky-400 via-indigo-300 to-sky-400',
]

function dateStr(iso: string): string {
  return new Date(iso).toLocaleDateString('hi-IN', { month: 'short', day: 'numeric' })
}

function sourceInitial(name: string): string {
  return (name.trim()[0] ?? '?').toUpperCase()
}

export function NewsView() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchNews() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/news', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch news')
      const data = await res.json()
      const items = Array.isArray(data.articles)
        ? data.articles.filter(
            (a: NewsArticle) => a.title && a.description && a.url && !a.title.includes('[Removed]')
          )
        : []
      setArticles(items)
    } catch (err) {
      console.error(err)
      setError('समाचार लोड करने में विफल। कृपया बाद में पुनः प्रयास करें।')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  const lead = articles[0] ?? null
  const rest = articles.slice(1)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-primary/70" />
            <h1 className="font-serif text-3xl sm:text-4xl text-primary tracking-wide">समाचार</h1>
            <span className="hidden sm:inline text-xs font-medium tracking-[0.25em] text-foreground/50 uppercase">
              Sanatan Dharm · Bharat
            </span>
          </div>
          <p className="mt-3 text-sm text-foreground/60 max-w-2xl">
            सनातन संस्कृति, मंदिर, पर्व और भारत की विरासत से जुड़ी ताज़ा खबरें — विभिन्न स्रोतों से।
          </p>
        </header>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState onRetry={fetchNews} />
        ) : (
          <>
            {lead && <LeadCard article={lead} />}

            {rest.length > 0 && (
              <section
                className="mt-6 columns-1 sm:columns-2 lg:columns-3 gap-6"
                aria-label="समाचार सूची"
              >
                {rest.map((article, i) => (
                  <div key={article.url} className="mb-6 break-inside-avoid">
                    <NewsCard article={article} tone={i} />
                  </div>
                ))}
              </section>
            )}

            {!lead && (
              <div className="rounded-2xl border border-gold/30 bg-background/50 p-10 text-center text-foreground/60">
                अभी कोई समाचार उपलब्ध नहीं है।
              </div>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

function LeadCard({ article }: { article: NewsArticle }) {
  const [imgFailed, setImgFailed] = useState(false)
  const hasImage = !!article.urlToImage && !imgFailed

  if (hasImage) {
    return (
      <article className="relative overflow-hidden rounded-2xl border border-gold/30">
        <img
          src={article.urlToImage ?? undefined}
          alt={article.title}
          loading="eager"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="h-[360px] sm:h-[440px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded-full bg-gold/90 px-3 py-1 text-xs font-semibold text-stone-950">
              {article.source.name}
            </span>
            <span className="text-xs text-white/70">{dateStr(article.publishedAt)}</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl text-white leading-tight max-w-3xl">
            {article.title}
          </h2>
          <p className="mt-3 text-white/80 text-sm sm:text-base max-w-2xl line-clamp-3">
            {article.description}
          </p>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-5 py-2.5 text-sm font-medium text-white hover:bg-white/25 transition-colors"
          >
            पूरा पढ़ें <ExternalLink className="size-4" />
          </a>
        </div>
      </article>
    )
  }

  return (
    <article className="relative rounded-2xl border border-gold/30 bg-gradient-to-br from-primary/15 via-background to-background p-6 sm:p-10 overflow-hidden">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold via-primary to-gold"
      />
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
          {article.source.name}
        </span>
        <span className="text-xs text-foreground/50">{dateStr(article.publishedAt)}</span>
      </div>
      <h2 className="font-serif text-2xl sm:text-4xl text-primary leading-tight max-w-3xl">
        {article.title}
      </h2>
      <p className="mt-4 text-foreground/75 text-sm sm:text-base max-w-2xl line-clamp-3">
        {article.description}
      </p>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        पूरा पढ़ें <ExternalLink className="size-4" />
      </a>
    </article>
  )
}

function NewsCard({ article, tone }: { article: NewsArticle; tone: number }) {
  const [imgFailed, setImgFailed] = useState(false)
  const hasImage = !!article.urlToImage && !imgFailed

  const body = (
    <>
      {hasImage ? (
        <div className="relative overflow-hidden rounded-t-xl">
          <img
            src={article.urlToImage ?? undefined}
            alt={article.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute top-3 left-3 rounded-full bg-stone-950/70 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-amber-100">
            {article.source.name}
          </span>
        </div>
      ) : (
        <span
          aria-hidden
          className={`block h-1.5 bg-gradient-to-r ${ACCENT_TONES[tone % ACCENT_TONES.length]}`}
        />
      )}
      <div className="p-5">
        {hasImage ? (
          <div className="flex items-center gap-2 mb-2 text-xs text-foreground/50">
            <span>{article.source.name}</span>
            <span className="size-1 rounded-full bg-foreground/30" />
            <span>{dateStr(article.publishedAt)}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-2 py-1 text-[11px] font-semibold text-primary">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {sourceInitial(article.source.name)}
              </span>
              {article.source.name}
            </span>
            <span className="text-xs text-foreground/45">{dateStr(article.publishedAt)}</span>
          </div>
        )}
        <h3
          className={`font-serif leading-snug line-clamp-3 ${hasImage ? 'text-lg text-foreground group-hover:text-primary transition-colors' : 'text-xl text-primary'}`}
        >
          {article.title}
        </h3>
        <p className="mt-2 text-sm text-foreground/70 line-clamp-2">{article.description}</p>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group/link"
        >
          पूरा पढ़ें
          <ChevronRight className="size-4 group-hover/link:translate-x-1 transition-transform" />
        </a>
      </div>
    </>
  )

  return (
    <article className="group rounded-xl border border-gold/30 bg-background/60 overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 transition-all duration-300">
      {body}
    </article>
  )
}

function LoadingState() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-foreground/60">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm">समाचार लोड हो रहा है…</p>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-foreground/70">समाचार लोड करने में समस्या आई।</p>
      <button
        onClick={onRetry}
        aria-label="समाचार पुनः लोड करें"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <RefreshCw className="size-4" /> पुनः प्रयास करें
      </button>
    </div>
  )
}