import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { SectionHeading } from '@/components/section-heading'
import { org } from '@/lib/content'

export const metadata: Metadata = {
  title: `Privacy Policy — ${org.shortName}`,
  description: 'गोपनीयता नीति — S.A.H.A.S.',
}

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHeading title="Privacy Policy" subtitle="गोपनीयता नीति" />
          <div className="mt-10 space-y-5 font-serif text-base leading-relaxed text-foreground/85">
            <p>
              S.A.H.A.S. आपकी गोपनीयता का सम्मान करता है। इस पृष्ठ पर संगठन की विस्तृत
              गोपनीयता नीति शीघ्र जोड़ी जाएगी।
            </p>
            <p>
              सदस्यता फ़ॉर्म के माध्यम से साझा की गई जानकारी का उपयोग केवल संगठन से
              संपर्क एवं सदस्यता प्रबंधन हेतु किया जाएगा।
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
