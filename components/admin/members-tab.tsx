'use client'

import { useState, useEffect } from 'react'
import { Loader2, Search, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface MemberRow {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  state: string
  district: string
  city: string
  member_code: string | null
  role: string
  created_at: string
}

export function MembersTab() {
  const [members, setMembers] = useState<MemberRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const { data, error: err } = await supabase
          .from('members')
          .select('*')
          .order('created_at', { ascending: false })
        if (err) throw err
        setMembers((data as MemberRow[]) ?? [])
      } catch (e) {
        console.error(e)
        setError('सदस्य सूची लोड करने में त्रुटि हुई।')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = members.filter((m) => {
    const q = search.toLowerCase()
    return (
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.city || '').toLowerCase().includes(q) ||
      (m.state || '').toLowerCase().includes(q) ||
      (m.member_code || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="rounded-lg border border-gold/30 bg-background/50 p-6 backdrop-blur">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-primary" />
          <h2 className="font-serif text-2xl text-primary">सदस्य सूची</h2>
          <span className="text-sm text-foreground/60">({members.length})</span>
        </div>
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-2.5 size-4 text-foreground/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="नाम, ईमेल, राज्य, शहर…"
            className="w-full rounded-md border border-gold/30 bg-background pl-9 pr-3 py-2 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary/60" />
        </div>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold/20">
                <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-foreground/60">नाम</th>
                <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-foreground/60">सदस्य कोड</th>
                <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-foreground/60">राज्य</th>
                <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-foreground/60">जिला</th>
                <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-foreground/60">शहर</th>
                <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-foreground/60">फोन</th>
                <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-foreground/60">ईमेल</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-gold/10 hover:bg-primary/5">
                  <td className="px-3 py-2.5 text-sm text-foreground font-medium">
                    {m.first_name} {m.last_name}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-primary">{m.member_code ?? '—'}</td>
                  <td className="px-3 py-2.5 text-sm text-foreground/80">{m.state}</td>
                  <td className="px-3 py-2.5 text-sm text-foreground/80">{m.district}</td>
                  <td className="px-3 py-2.5 text-sm text-foreground/80">{m.city}</td>
                  <td className="px-3 py-2.5 text-sm text-foreground/80">{m.phone ?? '—'}</td>
                  <td className="px-3 py-2.5 text-sm text-foreground/80">
                    {m.email ? (
                      <a href={`mailto:${m.email}`} className="text-primary underline hover:text-primary/80">
                        {m.email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-foreground/60">
                    कोई सदस्य नहीं मिला।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
