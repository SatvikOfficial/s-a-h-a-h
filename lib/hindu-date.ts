import { MoonPhase } from 'astronomy-engine'

// Hindu (Vikram Samvat) calendar — पूर्णिमांत (purnimanta) system used in North
// India / Hindi panchang. Each month runs from one Purnima to the next and is
// named after the Purnima that ends it. So a date belongs to the month of the
// NEXT Purnima. Tithi and paksha are computed astronomically via MoonPhase.
// Range: Chaitra 2082 (2025) through Phalguna 2084 (Jan 2028). Solo indexes
// verified against Kartik Amavasya = Diwali, Kartik Shukla Shashthi = Chhath.

export const HINDU_MONTHS_HI = [
  'चैत्र',
  'वैशाख',
  'ज्येष्ठ',
  'आषाढ़',
  'श्रावण',
  'भाद्रपद',
  'आश्विन',
  'कार्तिक',
  'मार्गशीर्ष',
  'पौष',
  'माघ',
  'फाल्गुन',
]

export const HINDU_MONTHS_EN = [
  'Chaitra',
  'Vaishakha',
  'Jyeshtha',
  'Ashadha',
  'Shravana',
  'Bhadrapada',
  'Ashvina',
  'Kartika',
  'Margashirsha',
  'Pausha',
  'Magha',
  'Phalguna',
]

export const TITHI_HI = [
  'प्रतिपदा',
  'द्वितीया',
  'तृतीया',
  'चतुर्थी',
  'पंचमी',
  'षष्ठी',
  'सप्तमी',
  'अष्टमी',
  'नवमी',
  'दशमी',
  'एकादशी',
  'द्वादशी',
  'त्रयोदशी',
  'चतुर्दशी',
  'पूर्णिमा',
  'प्रतिपदा',
  'द्वितीया',
  'तृतीया',
  'चतुर्थी',
  'पंचमी',
  'षष्ठी',
  'सप्तमी',
  'अष्टमी',
  'नवमी',
  'दशमी',
  'एकादशी',
  'द्वादशी',
  'त्रयोदशी',
  'चतुर्दशी',
  'अमावस्या',
]

export const TITHI_EN = [
  'Pratipada',
  'Dwitiya',
  'Tritiya',
  'Chaturthi',
  'Panchami',
  'Shashthi',
  'Saptami',
  'Ashtami',
  'Navami',
  'Dashami',
  'Ekadashi',
  'Dwadashi',
  'Trayodashi',
  'Chaturdashi',
  'Purnima',
  'Pratipada',
  'Dwitiya',
  'Tritiya',
  'Chaturthi',
  'Panchami',
  'Shashthi',
  'Saptami',
  'Ashtami',
  'Navami',
  'Dashami',
  'Ekadashi',
  'Dwadashi',
  'Trayodashi',
  'Chaturdashi',
  'Amavasya',
]

// Purnima dates (first day of the full-moon window) that END each purnimanta
// month, mapped to the month index. Sequence runs Phalguna -> Chaitra (year reset).
const PURNIMA_INDEX: Record<string, number> = {
  // VS 2082
  '2025-03-13': 11, // Phalguna
  '2025-04-12': 0, // Chaitra
  '2025-05-12': 1, // Vaishakha
  '2025-06-10': 2, // Jyeshtha
  '2025-07-10': 3, // Ashadha
  '2025-08-09': 4, // Shravana (Raksha Bandhan)
  '2025-09-07': 5, // Bhadrapada
  '2025-10-06': 6, // Ashvina (Sharad Purnima)
  '2025-11-05': 7, // Kartika
  '2025-12-04': 8, // Margashirsha
  '2026-01-03': 9, // Pausha
  '2026-02-01': 10, // Magha
  '2026-03-03': 11, // Phalguna
  // VS 2083
  '2026-04-01': 0, // Chaitra
  '2026-05-01': 1,
  '2026-05-30': 2,
  '2026-06-29': 3,
  '2026-07-29': 4, // Shravana
  '2026-08-27': 5,
  '2026-09-26': 6,
  '2026-10-25': 7, // Kartika
  '2026-11-24': 8,
  '2026-12-23': 9,
  '2027-01-22': 10,
  '2027-02-20': 11, // Phalguna
  // VS 2084
  '2027-03-22': 0, // Chaitra
  '2027-04-20': 1,
  '2027-05-19': 2,
  '2027-06-18': 3,
  '2027-07-18': 4, // Shravana
  '2027-08-16': 5,
  '2027-09-15': 6,
  '2027-10-15': 7, // Kartika
  '2027-11-13': 8,
  '2027-12-13': 9,
  '2028-01-11': 10,
  '2028-02-08': 11, // Phalguna
}

const PURNIMA_DATES = Object.keys(PURNIMA_INDEX).sort()

// Vikram Samvat new year starts at Chaitra Shukla Pratipada (Gudi Padwa/Ugadi).
const SAMVAT_SWITCH = [
  { date: '2026-03-19', samvat: 2083 },
  { date: '2027-03-08', samvat: 2084 },
]

function iso(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export interface HinduDate {
  tithiIndex: number // 0..29
  tithiHi: string
  tithiEn: string
  pakshaHi: string
  pakshaEn: string
  monthIndex: number // 0..11
  monthHi: string
  monthEn: string
  samvat: number
  isPurnima: boolean
  isAmavasya: boolean
}

export interface HinduMonthRange {
  start: string // first gregorian day (inclusive)
  end: string // last gregorian day (inclusive)
  monthIndex: number
  monthHi: string
  monthEn: string
  samvat: number
}

// Ordered Hindu months (purnimanta) as gregorian date ranges.
export function getHinduMonths(): HinduMonthRange[] {
  const months: HinduMonthRange[] = []
  for (let i = 0; i < PURNIMA_DATES.length; i++) {
    const prev = i === 0 ? '2025-02-12' : PURNIMA_DATES[i - 1]
    const start = addDays(prev, 1)
    const endDate = PURNIMA_DATES[i]
    const monthIndex = PURNIMA_INDEX[endDate]
    months.push({
      start,
      end: endDate,
      monthIndex,
      monthHi: HINDU_MONTHS_HI[monthIndex],
      monthEn: HINDU_MONTHS_EN[monthIndex],
      samvat: samvatFor(endDate),
    })
  }
  return months
}

const DAY_MS = 86400000

function addDays(isoDay: string, n: number): string {
  const d = new Date(isoDay + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return iso(d)
}

function samvatFor(isoDay: string): number {
  let samvat = 2082
  for (const s of SAMVAT_SWITCH) {
    if (isoDay >= s.date) samvat = s.samvat
  }
  return samvat
}

export function getHinduDate(date: Date): HinduDate | null {
  const dayKey = iso(date)
  if (dayKey < '2025-03-13' || dayKey > '2028-02-08') return null

  const phase = MoonPhase(date)
  let tithiIndex = Math.floor(phase / 12) % 30

  // Full-moon moment lands ~180° which is just past the Purnima (tithi 15)
  // span. On the exact Purnima boundary day, show पूर्णिमा.
  if (dayKey in PURNIMA_INDEX) tithiIndex = 14

  // Purnimanta: month = month of the next Purnima (>= date).
  let monthIndex = -1
  for (const p of PURNIMA_DATES) {
    if (dayKey <= p) {
      monthIndex = PURNIMA_INDEX[p]
      break
    }
  }
  if (monthIndex === -1) {
    monthIndex = PURNIMA_INDEX[PURNIMA_DATES[PURNIMA_DATES.length - 1]]
  }

  let samvat = 2082
  for (const s of SAMVAT_SWITCH) {
    if (dayKey >= s.date) samvat = s.samvat
  }

  return {
    tithiIndex,
    tithiHi: TITHI_HI[tithiIndex],
    tithiEn: TITHI_EN[tithiIndex],
    pakshaHi: tithiIndex < 15 ? 'शुक्ल' : 'कृष्ण',
    pakshaEn: tithiIndex < 15 ? 'Shukla' : 'Krishna',
    monthIndex,
    monthHi: HINDU_MONTHS_HI[monthIndex],
    monthEn: HINDU_MONTHS_EN[monthIndex],
    samvat,
    isPurnima: tithiIndex === 14,
    isAmavasya: tithiIndex === 29,
  }
}
