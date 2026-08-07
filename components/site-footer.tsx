import Image from 'next/image'
import Link from 'next/link'
import { org } from '@/lib/content'
import { SocialLinks } from '@/components/social-icons'

const footerLinks = [
  { label: 'हमारा परिचय', href: '/#about' },
  { label: 'संहिता', href: '/sanhita' },
  { label: 'गतिविधियाँ', href: '/#activities' },
  { label: 'जुड़ें', href: '/#join' },
  { label: 'संपर्क', href: '/#contact' },
]

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms / Disclaimer', href: '/terms' },
]

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        {/* Brand + mantra */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <div className="flex items-center gap-3">
            <Image
              src={org.logo || '/placeholder.svg'}
              alt={`${org.shortName} logo`}
              width={48}
              height={48}
              className="size-12 rounded-full object-cover ring-1 ring-gold/50"
            />
            <span className="font-serif text-2xl tracking-wide">{org.shortName}</span>
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.14em] text-primary-foreground/70">
            {org.fullName}
          </p>
          <blockquote className="mt-5 font-serif text-base leading-relaxed text-primary-foreground/90">
            <span className="block">धर्म की जय हो।</span>
            <span className="block">अधर्म का नाश हो।</span>
            <span className="block">प्राणियों में सद्भावना हो।</span>
            <span className="block">विश्व का कल्याण हो।</span>
          </blockquote>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col items-center gap-2 md:items-start" aria-label="फुटर नेविगेशन">
          <p className="mb-2 font-serif text-lg text-gold">पृष्ठ</p>
          {footerLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-serif text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Legal */}
        <nav className="flex flex-col items-center gap-2 md:items-start" aria-label="विधिक जानकारी">
          <p className="mb-2 font-serif text-lg text-gold">विधिक</p>
          {legalLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-serif text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <SocialLinks className="pb-10" iconClassName="text-primary-foreground/80 ring-primary-foreground/20 hover:text-primary-foreground hover:bg-primary-foreground/10" />

      <div className="border-t border-primary-foreground/15">
        <p className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-primary-foreground/60 sm:px-6">
          © {new Date().getFullYear()} {org.shortName} — {org.fullName}. सर्वाधिकार सुरक्षित।
        </p>
      </div>
    </footer>
  )
}
