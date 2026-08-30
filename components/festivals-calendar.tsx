'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { festivals } from '@/lib/festivals'
import {
  getHinduDate,
  getHinduMonths,
} from '@/lib/hindu-date'
import type { Language } from '@/lib/types'

const WEEKDAYS = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि']

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`
}

const HINDI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
function toHindi(num: number | string) {
  return String(num)
    .split('')
    .map((c) => (c >= '0' && c <= '9' ? HINDI_DIGITS[+c] : c))
    .join('')
}

export function FestivalsCalendar({ language }: { language: Language }) {
  const months = useMemo(() => getHinduMonths(), [])
  const todayKey = useMemo(() => {
    const now = new Date()
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  }, [])

  const [monthIdx, setMonthIdx] = useState(() =>
    Math.max(0, months.findIndex((m) => todayKey >= m.start && todayKey <= m.end))
  )

  const month = months[monthIdx]
  const [startDay, startKey] = useMemo(() => {
    const d = new Date(month.start + 'T12:00:00Z')
    return [d.getUTCDay(), `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`]
  }, [month])

  const days = useMemo(() => {
    const out: { key: string; day: number }[] = []
    const start = new Date(month.start + 'T12:00:00Z')
    const end = new Date(month.end + 'T12:00:00Z')
    let cur = new Date(start)
    while (cur <= end) {
      out.push({
        key: `${cur.getUTCFullYear()}-${pad(cur.getUTCMonth() + 1)}-${pad(cur.getUTCDate())}`,
        day: cur.getUTCDate(),
      })
      cur = new Date(cur.getTime() + 86400000)
    }
    return out
  }, [month])

  const cells: (typeof days[number] | null)[] = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (const d of days) cells.push(d)

  const move = (delta: number) => {
    const next = monthIdx + delta
    if (next < 0 || next >= months.length) return
    setMonthIdx(next)
  }

  return (
    <section id="festivals" className="border-b border-gold/20 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          title="हिंदू त्योहार कैलेंडर"
          subtitle="विक्रम संवत् के अनुसार मास, तिथि और पर्व — हर दिन की सटीक हिंदू तिथि।"
        />
        <div className="mt-10 rounded-lg border border-gold/30 bg-card p-4 shadow-sm sm:p-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => move(-1)}
              disabled={monthIdx === 0}
              className="rounded-md border border-primary/30 p-2 text-primary transition-colors hover:bg-secondary disabled:opacity-40"
              aria-label="पिछला मास"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="text-center">
              <h3 className="font-serif text-2xl text-primary">
                {month.monthHi} <span className="text-primary/60">संवत् {month.samvat}</span>
              </h3>
              <p className="text-xs text-foreground/50">
                {language === 'hi' ? toHindi(month.start) : month.start} —{' '}
                {language === 'hi' ? toHindi(month.end) : month.end}
              </p>
            </div>
            <button
              type="button"
              onClick={() => move(1)}
              disabled={monthIdx === months.length - 1}
              className="rounded-md border border-primary/30 p-2 text-primary transition-colors hover:bg-secondary disabled:opacity-40"
              aria-label="अगला मास"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {/* Weekday header */}
          <div className="mt-6 grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1 text-xs font-medium text-foreground/60">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((cell, i) => {
              if (!cell) {
                return <div key={`e${i}`} className="min-h-16 rounded-md border border-transparent" />
              }
              const fests = festivals[cell.key] || []
              const hindu = getHinduDate(new Date(cell.key + 'T12:00:00Z'))
              const tithiLabel = hindu ? `${hindu.pakshaHi} ${hindu.tithiHi}` : ''
              const isToday = cell.key === todayKey
              return (
                <div
                  key={cell.key}
                  className={`min-h-16 rounded-md border p-1 text-center ${
                    fests.length > 0
                      ? 'border-primary/40 bg-primary/10'
                      : isToday
                        ? 'border-gold/50 bg-secondary/60'
                        : 'border-transparent'
                  }`}
                >
                  <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {language === 'hi' ? toHindi(cell.day) : cell.day}
                  </span>
                  <span className="mt-0.5 block text-[9px] font-medium leading-tight text-foreground/60">
                    {tithiLabel}
                  </span>
                  {fests.length > 0 && (
                    <span className="mt-0.5 block text-[8px] font-medium leading-tight text-primary">
                      {fests.map((f) => (language === 'hi' ? f.hi : f.en)).join(', ')}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
