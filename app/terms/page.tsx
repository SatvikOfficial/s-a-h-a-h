import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { SectionHeading } from '@/components/section-heading'

export const metadata: Metadata = {
  title: 'Terms / Disclaimer',
  description: 'नियम एवं अस्वीकरण — S.A.H.A.S.',
}

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHeading title="Terms / Disclaimer" subtitle="नियम एवं अस्वीकरण" />
          <div className="mt-10 space-y-5 font-serif text-base leading-relaxed text-foreground/85">
            <p>
              इस वेबसाइट का उद्देश्य S.A.H.A.S. संगठन के विचार, सिद्धांत एवं
              गतिविधियों की जानकारी साझा करना है।
            </p>
            <p>
              संगठन के विस्तृत नियम एवं अस्वीकरण शीघ्र इस पृष्ठ पर जोड़े जाएंगे।
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
