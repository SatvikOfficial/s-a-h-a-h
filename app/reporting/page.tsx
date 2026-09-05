import type { Metadata } from 'next'
import { ReportingView } from './reporting-view'
import { org } from '@/lib/content'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'रिपोर्ट / जुड़ें',
  description:
    'S.A.H.A.S. सदस्यता पंजीकरण एवं रिपोर्टिंग। धर्म की रक्षा के लिए सूचना दें और सनातनियों के संगठन से जुड़ें।',
  keywords: [
    'सदस्यता पंजीकरण',
    'रिपोर्ट करें',
    'हिंदू संगठन',
    'join S.A.H.A.S.',
    'report intruder',
    'S.A.H.A.S. membership',
  ],
  openGraph: {
    title: 'रिपोर्ट / जुड़ें',
    description: 'S.A.H.A.S. सदस्यता पंजीकरण एवं रिपोर्टिंग।',
    url: absoluteUrl('/reporting'),
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

export default function ReportingPage() {
  return <ReportingView />
}