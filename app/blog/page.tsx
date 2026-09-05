import type { Metadata } from 'next'
import { BlogView } from './blog-view'
import { org } from '@/lib/content'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'ब्लॉग',
  description:
    'सनातन धर्म, हिंदू संस्कृति, परंपराओं और त्योहारों पर लेख। S.A.H.A.S. के विचार और जागरूकता से जुड़ी सामग्री।',
  keywords: [
    'सनातन धर्म लेख',
    'हिंदू संस्कृति ब्लॉग',
    'Hindu blog',
    'Sanatan Dharma articles',
    'S.A.H.A.S. blog',
    'हिंदू त्योहार',
  ],
  openGraph: {
    title: 'ब्लॉग',
    description:
      'सनातन धर्म, हिंदू संस्कृति, परंपराओं और त्योहारों पर लेख।',
    url: absoluteUrl('/blog'),
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
    card: 'summary_large_image',
    images: [absoluteUrl(org.logo)],
  },
}

export default function BlogPage() {
  return <BlogView />
}