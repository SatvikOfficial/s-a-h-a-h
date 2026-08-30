'use client'

import { useState, useEffect } from 'react'
import { Loader2, Trash2, Plus, Pencil, Languages, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface BlogRow {
  id: string
  title_hi: string
  title_en: string
  content_hi: string
  content_en: string
  published: boolean
  created_at: string
  updated_at: string
}

const emptyForm = {
  title_hi: '',
  title_en: '',
  content_hi: '',
  content_en: '',
  published: true,
}

export function BlogTab() {
  const [posts, setPosts] = useState<BlogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'list' | 'new' | 'edit'>('list')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState<'hi-en' | 'en-hi' | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = async () => {
    const { data, error: err } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false })
    setLoading(false)
    if (err) {
      console.error(err)
      setError('ब्लॉग लोड करने में त्रुटि।')
      return
    }
    setPosts((data as BlogRow[]) ?? [])
  }

  useEffect(() => {
    setLoading(true)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateField = (key: keyof typeof emptyForm, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const translate = async (dir: 'hi-en' | 'en-hi') => {
    const source = dir === 'hi-en' ? 'hi' : 'en'
    const target = dir === 'hi-en' ? 'en' : 'hi'
    const sourceTitle = source === 'hi' ? form.title_hi : form.title_en
    const sourceContent = source === 'hi' ? form.content_hi : form.content_en
    if (!sourceTitle.trim()) return

    setTranslating(dir)
    setError(null)
    try {
      const [titleRes, contentRes] = await Promise.all([
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: sourceTitle, source, target }),
        }).then((r) => r.json()),
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: sourceContent, source, target }),
        }).then((r) => r.json()),
      ])

      updateField(target === 'hi' ? 'title_hi' : 'title_en', titleRes.text ?? '')
      updateField(target === 'hi' ? 'content_hi' : 'content_en', contentRes.text ?? '')
    } catch (e) {
      console.error(e)
      setError('अनुवाद करने में त्रुटि हुई।')
    } finally {
      setTranslating(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title_hi.trim()) {
      setError('हिंदी शीर्षक आवश्यक है।')
      return
    }
    if (!form.content_hi.trim()) {
      setError('हिंदी सामग्री आवश्यक है।')
      return
    }
    setSaving(true)
    setError(null)

    if (mode === 'new') {
      const { error: err } = await supabase.from('blogs').insert({
        title_hi: form.title_hi.trim(),
        title_en: form.title_en.trim(),
        content_hi: form.content_hi.trim(),
        content_en: form.content_en.trim(),
        published: form.published,
      })
      setSaving(false)
      if (err) {
        console.error(err)
        setError('सहेजने में त्रुटि हुई।')
        return
      }
    } else {
      const { error: err } = await supabase
        .from('blogs')
        .update({
          title_hi: form.title_hi.trim(),
          title_en: form.title_en.trim(),
          content_hi: form.content_hi.trim(),
          content_en: form.content_en.trim(),
          published: form.published,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId)
      setSaving(false)
      if (err) {
        console.error(err)
        setError('सहेजने में त्रुटि हुई।')
        return
      }
    }

    setMode('list')
    setForm(emptyForm)
    setEditingId(null)
    load()
  }

  const startEdit = (p: BlogRow) => {
    setEditingId(p.id)
    setForm({
      title_hi: p.title_hi,
      title_en: p.title_en,
      content_hi: p.content_hi,
      content_en: p.content_en,
      published: p.published,
    })
    setMode('edit')
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const { error: err } = await supabase.from('blogs').delete().eq('id', id)
    setDeleting(null)
    if (err) {
      console.error(err)
      return
    }
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  const togglePublish = async (p: BlogRow) => {
    const { error: err } = await supabase
      .from('blogs')
      .update({ published: !p.published, updated_at: new Date().toISOString() })
      .eq('id', p.id)
    if (err) {
      console.error(err)
      return
    }
    setPosts((prev) => prev.map((x) => (x.id === p.id ? { ...x, published: !p.published } : x)))
  }

  // ---------- Editor view ----------
  if (mode === 'new' || mode === 'edit') {
    return (
      <div className="rounded-lg border border-gold/30 bg-background/50 p-6 backdrop-blur">
        <h2 className="font-serif text-2xl text-primary">
          {mode === 'new' ? 'नया ब्लॉग' : 'ब्लॉग संपादित करें'}
        </h2>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => translate('hi-en')}
            disabled={translating !== null}
            className="inline-flex items-center gap-2 rounded-md border border-primary/30 px-3 py-1.5 text-sm text-primary hover:bg-secondary disabled:opacity-50"
          >
            {translating === 'hi-en' ? <Loader2 className="size-4 animate-spin" /> : <Languages className="size-4" />}
            हिंदी → अंग्रेज़ी
          </button>
          <button
            type="button"
            onClick={() => translate('en-hi')}
            disabled={translating !== null}
            className="inline-flex items-center gap-2 rounded-md border border-primary/30 px-3 py-1.5 text-sm text-primary hover:bg-secondary disabled:opacity-50"
          >
            {translating === 'en-hi' ? <Loader2 className="size-4 animate-spin" /> : <Languages className="size-4" />}
            अंग्रेज़ी → हिंदी
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-1">शीर्षक (हिंदी) *</label>
              <input
                type="text"
                value={form.title_hi}
                onChange={(e) => updateField('title_hi', e.target.value)}
                className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-1">शीर्षक (अंग्रेज़ी)</label>
              <input
                type="text"
                value={form.title_en}
                onChange={(e) => updateField('title_en', e.target.value)}
                className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-1">सामग्री (हिंदी) *</label>
            <textarea
              value={form.content_hi}
              onChange={(e) => updateField('content_hi', e.target.value)}
              rows={6}
              className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-1">सामग्री (अंग्रेज़ी)</label>
            <textarea
              value={form.content_en}
              onChange={(e) => updateField('content_en', e.target.value)}
              rows={6}
              className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground/90">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => updateField('published', e.target.checked)}
              className="size-4 accent-[oklch(0.41_0.13_25)]"
            />
            प्रकाशित करें
          </label>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setMode('list')
                setForm(emptyForm)
                setEditingId(null)
                setError(null)
              }}
              className="rounded-md border border-primary/30 px-4 py-2 font-serif text-foreground hover:bg-secondary"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-serif text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {saving ? 'सहेजा जा रहा है…' : 'सहेजें'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // ---------- List view ----------
  return (
    <div className="rounded-lg border border-gold/30 bg-background/50 p-6 backdrop-blur">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-2xl text-primary">ब्लॉग नियंत्रण</h2>
        <button
          type="button"
          onClick={() => {
            setMode('new')
            setForm(emptyForm)
            setEditingId(null)
            setError(null)
          }}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-serif text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" />
          नया ब्लॉग
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary/60" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-foreground/60 py-8">अभी कोई ब्लॉग नहीं है। "नया ब्लॉग" से बनाएँ।</p>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-lg border border-gold/20 bg-primary/5 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-serif text-primary truncate">{p.title_hi || p.title_en}</p>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs ${
                      p.published ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {p.published ? 'प्रकाशित' : 'प्रारूप'}
                  </span>
                </div>
                <p className="text-xs text-foreground/50 mt-1">
                  {new Date(p.updated_at || p.created_at).toLocaleDateString('hi-IN')}
                  {p.title_en ? ' • ' : ''}
                  {p.title_en ? 'EN: ' + p.title_en : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => togglePublish(p)}
                className="shrink-0 rounded-md border border-primary/30 px-3 py-1.5 text-xs text-primary hover:bg-secondary"
              >
                {p.published ? 'अप्रकाशित करें' : 'प्रकाशित करें'}
              </button>
              <button
                type="button"
                onClick={() => startEdit(p)}
                className="shrink-0 rounded-md border border-primary/30 p-2 text-primary hover:bg-secondary"
                aria-label="संपादित करें"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                disabled={deleting === p.id}
                className="shrink-0 rounded-md p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                aria-label="हटाएँ"
              >
                {deleting === p.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
