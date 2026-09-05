import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Tiro_Devanagari_Hindi, Mukta } from 'next/font/google'
import { org } from '@/lib/content'
import { absoluteUrl } from '@/lib/site'
import { CursorGlow } from '@/components/cursor-glow'
import './globals.css'
const tiro = Tiro_Devanagari_Hindi({
  subsets: ['latin', 'devanagari'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-tiro',
  display: 'swap',
})

const mukta = Mukta({
  subsets: ['latin', 'devanagari'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-mukta',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl('/')),
  title: {
    default: 'S.A.H.A.S. — Sanatan Asmita & Hindu Adhikar Sangathan',
    template: `%s | ${org.shortName}`,
  },
  description:
    'सनातन धर्म, हिंदू अस्मिता, संस्कृति, परंपराओं और गौरव के संरक्षण एवं संवर्धन के लिए समर्पित संगठन। Dedicated to the preservation and promotion of Sanatan Dharma, Hindu identity, culture, and heritage.',
  keywords: [
    'S.A.H.A.S.',
    'Sanatan Asmita',
    'Hindu Adhikar Sangathan',
    'सनातन धर्म',
    'हिंदू संगठन',
    'Hindu culture',
    'Sanatan Dharma',
    'सनातन अस्मिता',
    'हिंदू अस्मिता',
    'Hindu organization India',
    'Hindu news',
    'sanatan sangathan',
  ],
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'S.A.H.A.S. — Sanatan Asmita & Hindu Adhikar Sangathan',
    description:
      'सनातन धर्म, हिंदू अस्मिता, संस्कृति, परंपराओं और गौरव के संरक्षण एवं संवर्धन के लिए समर्पित संगठन।',
    url: absoluteUrl('/'),
    siteName: 'S.A.H.A.S.',
    locale: 'hi_IN',
    alternateLocale: 'en_US',
    type: 'website',
    images: [
      {
        url: absoluteUrl(org.logo),
        width: 512,
        height: 512,
        alt: 'S.A.H.A.S. logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'S.A.H.A.S. — Sanatan Asmita & Hindu Adhikar Sangathan',
    description:
      'सनातन धर्म, हिंदू अस्मिता, संस्कृति, परंपराओं और गौरव के संरक्षण एवं संवर्धन के लिए समर्पित संगठन।',
    images: [absoluteUrl(org.logo)],
  },
}

export const viewport: Viewport = {
  themeColor: '#7a1f27',
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="hi" className={`${tiro.variable} ${mukta.variable} bg-background`}>
      <body className="font-sans antialiased">
        <CursorGlow />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: org.fullName,
              alternateName: [org.shortName, org.fullNameHi],
              url: absoluteUrl('/'),
              logo: absoluteUrl(org.logo),
              description: org.intro,
              email: org.contact.email,
              telephone: org.contact.mobile,
              sameAs: [
                'https://instagram.com/sahasmovement',
                'https://facebook.com/sahasmovement',
                'https://x.com/sahasmovement',
                'https://youtube.com/@sahasmovement',
              ],
            }),
          }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
