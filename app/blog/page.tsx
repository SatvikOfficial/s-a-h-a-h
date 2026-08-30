'use client'

import { useState, useEffect } from 'react'
import { Globe, Loader2, BookOpen, ChevronDown } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { supabase } from '@/lib/supabase'
import type { Language } from '@/lib/types'

interface BlogPost {
  id: string
  title_hi: string
  title_en: string
  content_hi: string
  content_en: string
  published: boolean
  created_at: string
}

export default function BlogPage() {
  const [language, setLanguage] = useState<Language>('hi')
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const { data, error: err } = await supabase
          .from('blogs')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })
        if (err) throw err
        setPosts((data as BlogPost[]) ?? [])
      } catch (e) {
        console.error(e)
        setError('ब्लॉग लोड करने में त्रुटि हुई। कृपया बाद में पुनः प्रयास करें।')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary parchment-texture pt-16 pb-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="inline-flex items-center gap-2 p-3 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <BookOpen className="size-6 text-primary" />
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-normal text-primary">S.A.H.A.S. ब्लॉग</h1>
              <p className="mt-3 text-foreground/70 max-w-xl">
                विचार, आलेख और सनातन से जुड़ी प्रेरक रचनाएँ। पढ़ें और अपने विचार साझा करें।
              </p>
            </div>
            <button
              onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
              className="flex items-center gap-2 rounded-md border border-primary/30 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-secondary whitespace-nowrap"
            >
              <Globe className="size-4" />
              <span>भाषा बदलें / Change Language</span>
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="size-10 animate-spin text-primary/60 mb-4" />
              <p className="text-foreground/60">ब्लॉग लोड हो रहे हैं...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-500/10 rounded-xl border border-red-500/20 max-w-lg mx-auto">
              <p className="text-red-600">{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 rounded-xl border border-gold/30 bg-background/50">
              <p className="text-foreground/60">अभी कोई ब्लॉग उपलब्ध नहीं है। जल्द ही नए लेख प्रकाशित होंगे।</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => {
                const title = language === 'hi' ? post.title_hi || post.title_en : post.title_en || post.title_hi
                const content = language === 'hi' ? post.content_hi || post.content_en : post.content_en || post.content_hi
                const isOpen = expandedId === post.id
                return (
                  <article key={post.id} className="rounded-lg border border-gold/30 bg-background/50 p-6 backdrop-blur shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="font-serif text-2xl text-primary">{title}</h2>
                      {content.length > 220 && (
                        <button
                          onClick={() => setExpandedId(isOpen ? null : post.id)}
                          className="shrink-0 inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                        >
                          {isOpen ? 'कम दिखाएँ' : 'पूरा पढ़ें'}
                          <ChevronDown className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-foreground/50">
                      {new Date(post.created_at).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className={`mt-4 font-serif text-foreground/85 leading-relaxed whitespace-pre-wrap ${!isOpen && content.length > 220 ? 'line-clamp-4' : ''}`}>
                      {content}
                    </p>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
