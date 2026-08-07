import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary parchment-texture flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg border border-gold/30 bg-background/50 p-8 text-center backdrop-blur">
          <p className="font-serif text-6xl font-normal text-primary">404</p>
          <h1 className="mt-4 font-serif text-2xl font-normal text-primary">
            पृष्ठ नहीं मिला
          </h1>
          <p className="mt-3 text-foreground/70">
            आपके द्वारा खोजा गया पृष्ठ मौजूद नहीं है या स्थानांतरित कर दिया गया है।
          </p>
          <Link
            href="/"
            className="mt-6 inline-block w-full rounded-md bg-primary px-4 py-2 font-serif text-primary-foreground transition-all hover:bg-primary/90"
          >
            मुख्य पृष्ठ पर जाएं
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
