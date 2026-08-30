'use client'

import { useState, useEffect } from 'react'
import { Loader2, Trash2, MonitorPlay, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface YoutubeRow {
  id: string
  title: string
  video_id: string
  description: string | null
  created_at: string
}

function extractVideoId(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  // Full URL cases
  const urlMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/,
  )
  if (urlMatch) return urlMatch[1]
  // Plain 11-char id
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed
  return null
}

export function YouTubeTab() {
  const [links, setLinks] = useState<YoutubeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [videoInput, setVideoInput] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = async () => {
    const { data, error: err } = await supabase
      .from('youtube_links')
      .select('*')
      .order('created_at', { ascending: false })
    setLoading(false)
    if (err) {
      console.error(err)
      setError('YouTube लिंक लोड करने में त्रुटि।')
      return
    }
    setLinks((data as YoutubeRow[]) ?? [])
  }

  useEffect(() => {
    setLoading(true)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const videoId = extractVideoId(videoInput)
    if (!title.trim()) {
      setFormError('कृपया शीर्षक दर्ज करें।')
      return
    }
    if (!videoId) {
      setFormError('कृपया एक मान्य YouTube URL या वीडियो ID दर्ज करें।')
      return
    }
    setSaving(true)
    const { error: err } = await supabase.from('youtube_links').insert({
      title: title.trim(),
      video_id: videoId,
      description: description.trim(),
    })
    setSaving(false)
    if (err) {
      console.error(err)
      setFormError('सहेजने में त्रुटि हुई।')
      return
    }
    setTitle('')
    setVideoInput('')
    setDescription('')
    load()
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const { error: err } = await supabase.from('youtube_links').delete().eq('id', id)
    setDeleting(null)
    if (err) {
      console.error(err)
      return
    }
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }

  return (
    <div className="rounded-lg border border-gold/30 bg-background/50 p-6 backdrop-blur">
      <div className="mb-6 flex items-center gap-2">
        <MonitorPlay className="size-5 text-primary" />
        <h2 className="font-serif text-2xl text-primary">YouTube लिंक</h2>
      </div>

      <form onSubmit={handleAdd} className="mb-8 space-y-4 rounded-lg border border-gold/20 bg-primary/5 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-1">शीर्षक</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
              placeholder="वीडियो का शीर्षक"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-1">
              YouTube URL या Video ID
            </label>
            <input
              type="text"
              value={videoInput}
              onChange={(e) => setVideoInput(e.target.value)}
              className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
              placeholder="https://youtube.com/watch?v=…"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/90 mb-1">विवरण (वैकल्पिक)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
          />
        </div>
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-serif text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-70"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          {saving ? 'सहेजा जा रहा है…' : 'लिंक जोड़ें'}
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary/60" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : links.length === 0 ? (
        <p className="text-center text-foreground/60 py-8">अभी कोई YouTube लिंक नहीं है। ऊपर से जोड़ें।</p>
      ) : (
        <div className="space-y-3">
          {links.map((l) => (
            <div key={l.id} className="flex items-center gap-4 rounded-lg border border-gold/20 bg-primary/5 p-3">
              <div className="w-28 shrink-0 aspect-video overflow-hidden rounded bg-black">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${l.video_id}`}
                  title={l.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif text-primary">{l.title}</p>
                {l.description && <p className="text-sm text-foreground/70 truncate">{l.description}</p>}
                <p className="text-xs text-foreground/50">
                  {new Date(l.created_at).toLocaleDateString('hi-IN')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(l.id)}
                disabled={deleting === l.id}
                className="shrink-0 rounded-md p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                aria-label="हटाएँ"
              >
                {deleting === l.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
