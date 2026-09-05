import type { Metadata } from 'next'
import { NewsView } from './news-view'
import { org } from '@/lib/content'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'समाचार',
  description:
    'मंदिर, त्योहार, सनातन धर्म और भारतीय संस्कृति से जुड़ी हिंदी समाचार। S.A.H.A.S. द्वारा चयनित राष्ट्रीय अपडेट।',
  keywords: [
    'हिंदू समाचार',
    'सनातन धर्म समाचार',
    'मंदिर समाचार',
    'त्योहार समाचार',
    'Hindu news',
    'Sanatan Dharma news',
    'temples news India',
    'S.A.H.A.S. news',
  ],
  openGraph: {
    title: 'समाचार',
    description:
      'मंदिर, त्योहार, सनातन धर्म और भारतीय संस्कृति से जुड़ी हिंदी समाचार।',
    url: absoluteUrl('/news'),
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

export default function NewsPage() {
  return <NewsView />
}