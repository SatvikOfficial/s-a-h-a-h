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
  title: 'S.A.H.A.S. — Sanatan Asmita & Hindu Adhikar Sangathan',
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
  ],
  generator: 'v0.app',
  openGraph: {
    title: 'S.A.H.A.S. — Sanatan Asmita & Hindu Adhikar Sangathan',
    description:
      'सनातन धर्म, हिंदू अस्मिता, संस्कृति, परंपराओं और गौरव के संरक्षण एवं संवर्धन के लिए समर्पित संगठन।',
    url: absoluteUrl('/'),
    siteName: 'S.A.H.A.S.',
    locale: 'hi_IN',
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
    card: 'summary',
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
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
