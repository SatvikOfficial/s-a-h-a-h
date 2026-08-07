'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { nav, org } from '@/lib/content'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-gold/30 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/#home" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src={org.logo || '/placeholder.svg'}
            alt={`${org.shortName} logo`}
            width={48}
            height={48}
            priority
            className="size-11 rounded-full object-cover ring-1 ring-gold/50 sm:size-12"
          />
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-lg font-normal tracking-wide text-primary sm:text-xl">
              {org.shortName}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground sm:text-xs">
              {org.fullName}
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="मुख्य नेविगेशन">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 font-serif text-[15px] text-foreground/80 transition-colors hover:bg-secondary hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Report button */}
        <Link
          href="/reporting"
          className="hidden rounded-md bg-red-600 px-4 py-2 font-serif text-sm font-normal text-white transition-all hover:bg-red-700 sm:inline-block"
        >
          विदेशी घुसपैठिये
        </Link>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-primary lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'मेन्यू बंद करें' : 'मेन्यू खोलें'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <nav
        id="mobile-menu"
        aria-label="मोबाइल नेविगेशन"
        className={cn(
          'overflow-hidden border-t border-gold/20 bg-card lg:hidden',
          open ? 'max-h-96' : 'max-h-0 border-t-0',
        )}
        style={{ transition: 'max-height 0.25s ease' }}
      >
        <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-2 py-3 font-serif text-base text-foreground/80 transition-colors hover:bg-secondary hover:text-primary"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="border-t border-gold/20 py-2">
            <Link
              href="/reporting"
              onClick={() => setOpen(false)}
              className="block w-full rounded-md bg-red-600 px-2 py-3 text-center font-serif text-base font-normal text-white transition-all hover:bg-red-700"
            >
              विदेशी घुसपैठिये
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
