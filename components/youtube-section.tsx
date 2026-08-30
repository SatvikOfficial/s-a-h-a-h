'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { Reveal } from '@/components/reveal'
import { supabase } from '@/lib/supabase'
import { social } from '@/lib/content'

const DEFAULT_VIDEO_ID = 'EcwZsg26CDE'

interface YouTubeLink {
  id: string
  title: string
  video_id: string
  description: string | null
}

export function YouTubeSection() {
  const [latest, setLatest] = useState<YouTubeLink | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('youtube_links')
          .select('id, title, video_id, description')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (data) setLatest(data)
      } catch (e) {
        console.error('Failed to load youtube link', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const videoId = latest?.video_id || DEFAULT_VIDEO_ID
  const videoTitle =
    latest?.title ||
    'S.A.H.A.S. — संकल्प और विचार'
  const channelUrl = social.find((s) => s.icon === 'youtube')?.href

  return (
    <section id="youtube" className="border-b border-gold/20 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            title="हमारा YouTube"
            subtitle="S.A.H.A.S. के विचार, आयोजन और संकल्प सुनें। चैनल को सब्सक्राइब करना न भूलें।"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-8 animate-spin text-primary/60" />
            </div>
          ) : (
            <div className="rounded-lg border border-gold/30 bg-card p-3 shadow-sm sm:p-4">
              <div className="aspect-video overflow-hidden rounded-md bg-black">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
                  title={videoTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
              <div className="flex flex-col items-start justify-between gap-3 px-2 py-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-serif text-lg text-primary">{videoTitle}</h3>
                  {latest?.description ? (
                    <p className="mt-1 font-serif text-sm text-foreground/70">{latest.description}</p>
                  ) : null}
                </div>
                {channelUrl && (
                  <a
                    href={channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 rounded-md bg-red-600 px-4 py-2 font-serif text-sm text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-md active:translate-y-0 active:scale-[0.97]"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    YouTube चैनल देखें
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        </Reveal>
      </div>
    </section>
  )
}
