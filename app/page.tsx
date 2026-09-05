import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { GitaSection } from '@/components/gita-section'
import { RevolutionSection } from '@/components/revolution-section'
import { FlowSection } from '@/components/flow-section'
import { AboutSection } from '@/components/about-section'
import { MissionSection } from '@/components/mission-section'
import { ActivitiesSection } from '@/components/activities-section'
import { YouTubeSection } from '@/components/youtube-section'
import { FestivalsCalendar } from '@/components/festivals-calendar'
import { Tributes } from '@/components/tributes'
import { JoinSection } from '@/components/join-section'
import { ContactSection } from '@/components/contact-section'
import { SiteFooter } from '@/components/site-footer'

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      {/* main is a flex column so we can reorder sections responsively */}
      <main className="flex flex-col">
        <Hero />
        <YouTubeSection />
        <GitaSection />
        <RevolutionSection />
        <FlowSection />
        <AboutSection />
        <MissionSection />
        <ActivitiesSection />
        <Tributes />
        <FestivalsCalendar language="hi" />
        <JoinSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  )
}
