import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Article {
  title: string
  description: string
  url: string
  urlToImage: string | null
  source: { name: string }
  publishedAt: string
  relevance: number
}

// In-memory cache so repeated requests don't hit 19 external feeds each time.
// `force-dynamic` (above) intentionally keeps the route request-scoped, so this
// module-level cache is the only layer preventing redundant upstream fetches.
const CACHE_TTL_MS = 5 * 60 * 1000
let cache: { articles: Article[]; fetchedAt: number } | null = null

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

function googleNewsRss(search: string) {
  const base = 'https://news.google.com/rss'
  const query = `/search?q=${encodeURIComponent(search)}&hl=hi-IN&gl=IN&ceid=IN:hi`
  return `${base}${query}`
}

// Hindi topic feeds
const TOPIC_FEEDS = [
  'हिंदू मंदिर',
  'हिंदू त्योहार',
  'सनातन धर्म',
  'भारतीय संस्कृति विरासत',
  'श्रीराम मंदिर अयोध्या',
  'काशी विश्वनाथ',
  'राष्ट्रवाद भारत',
  'भारतीय सेना सीमा',
]

// X/Twitter pro-Hindu channels — match on the channel's name/@handle as a Google News
// search term. (Note: Google News RSS does NOT index individual X/twitter profile
// pages via site:, so site: queries return nothing. Matching by name returns articles
// that reference or are produced by these channels. Only feeds verified to return
// on-topic pro-Hindu content are kept.)
const X_CHANNEL_QUERIES = [
  'Vishva Hindu Parishad',
  'Hindu American Foundation',
  'Sanatan Prabhat',
  'OpIndia',
  'Swarajya',
  'Nupur Sharma',
  'Shefali Vaidya',
  'Vivek Agnihotri',
  'Rishi Bagree',
  'Anand Ranganathan',
  'Kashmiri Pandit',
]

// Combined feed list: Hindi topics + X channel names
const FEEDS = [...TOPIC_FEEDS, ...X_CHANNEL_QUERIES]

// Direct publisher feeds that DO embed real thumbnails in their XML (Google News
// RSS does not). Each item is still keyword-scored, but image items pass a slightly
// lower bar so the section keeps a healthy visual rhythm.
const IMAGE_FEEDS = [
  'https://feeds.bbci.co.uk/hindi/rss.xml',
  'https://www.opindia.com/feed/',
  'https://www.thehindu.com/news/feeder/default.rss',
  'https://www.thebetterindia.com/feed/',
  'https://indianexpress.com/feed/',
]

const IMAGE_FEED_LABELS: Record<string, string> = {
  'https://feeds.bbci.co.uk/hindi/rss.xml': 'BBC हिंदी',
  'https://www.opindia.com/feed/': 'OpIndia',
  'https://www.thehindu.com/news/feeder/default.rss': 'The Hindu',
  'https://www.thebetterindia.com/feed/': 'The Better India',
  'https://indianexpress.com/feed/': 'The Indian Express',
}

function sourceLabel(url: string): string {
  return IMAGE_FEED_LABELS[url] ?? new URL(url).hostname.replace(/^www\./, '')
}

// Relevance keywords in Hindi. Title matches score x2, description matches x1.
// Articles must score 3+ to appear, so generic/unrelated hits get filtered out.
const BASE_KEYWORDS = [
  'मंदिर',
  'श्रीराम',
  'राम मंदिर',
  'अयोध्या',
  'काशी',
  'बाबा विश्वनाथ',
  'हनुमान',
  'भगवान शिव',
  'श्री कृष्ण',
  'कृष्ण',
  'जन्माष्टमी',
  'नवरात्रि',
  'दुर्गा',
  'शिवरात्रि',
  'होली',
  'दिवाली',
  'गणेश चतुर्थी',
  'रक्षाबंधन',
  'मकर संक्रांति',
  'छठ',
  'त्योहार',
  'पर्व',
  'उत्सव',
  'पूजा',
  'आरती',
  'यज्ञ',
  'हवन',
  'भक्ति',
  'गीता',
  'रामायण',
  'महाभारत',
  'वेद',
  'पुराण',
  'तीर्थ',
  'गंगा',
  'यमुना',
  'तिरुपति',
  'जगन्नाथ',
  'सोमनाथ',
  'प्रयागराज',
  'उज्जैन',
  'मथुरा',
  'वृंदावन',
  'सनातन',
  'हिंदू',
  'हिन्दू',
  'धर्म',
  'संस्कृति',
  'विरासत',
  'साधु',
  'संन्यासी',
  'स्वामी',
  'महंत',
  'पुजारी',
  'महाराज',
  'बाबा',
  'संघ',
  'विहिप',
  'बजरंग दल',
  'राष्ट्रवाद',
  'देशभक्त',
  'भारतीय सेना',
  'सेना',
  'सीमा',
  'आतंकी',
  'आतंकवाद',
  'शौर्य',
  'पराक्रम',
  'वीर',
  'जवान',
  'नमो',
  'मोदी',
  'गौ'
]

// English variants so the image-bearing English feeds (OpIndia, The Hindu,
// Better India, Indian Express) score correctly too.
const EN_KEYWORDS = [
  'sanatan',
  'sanatana',
  'sanatana dharma',
  'hindu',
  'hindutva',
  'hindu american',
  'hinduism',
  'temple',
  'ayodhya',
  'ram mandir',
  'kashi',
  'varanasi',
  'ganga',
  'dharma',
  'bhagavad gita',
  'gita',
  'vishva hindu parishad',
  'vhp',
  'kashmiri pandit',
  'hanuman',
  'krishna',
  'navratri',
  'diwali',
  'holi',
  'puja',
  'yogi',
  'uttarakhand',
]

const KEYWORDS = [...BASE_KEYWORDS, ...EN_KEYWORDS]

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

// Google News RSS does not include thumbnails in its XML (verified: no <img> or
// <enclosure> is present), so articles have no source image. The client renders
// a branded placeholder instead.
function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Normalize a title for duplicate detection: lowercase, strip punctuation and
// fold diacritic/typographic variants so the same story found across multiple
// feeds (with slightly different titles) collapses into one entry.
function normalizeTitle(t: string): string {
  return t
    .toLowerCase()
    .replace(/[।|‧…]/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function scoreArticle(title: string, description: string): number {
  const t = title.toLowerCase()
  const d = description.toLowerCase()
  let score = 0
  for (const kw of KEYWORDS) {
    const tl = kw.toLowerCase()
    if (t.includes(tl)) score += 2
    if (d.includes(tl)) score += 1
  }
  return score
}

// Extract a thumbnail URL from a raw feed item. RSS wire formats vary: some use
// <enclosure>, some <media:content>/<media:thumbnail>, a few inline <img>. We try
// each in order and return the first image-type URL found.
function extractItemImage(block: string): string | null {
  const patterns = [
    /<enclosure[^>]+type="image[^"]*"[^>]*url="([^"]+)"/i,
    /<enclosure[^>]+url="([^"]+)"[^>]*type="image[^"]*"/i,
    /<media:content[^>]+medium="image"[^>]*url="([^"]+)"/i,
    /<media:content[^>]+url="([^"]+)"[^>]*medium="image"/i,
    /<media:thumbnail[^>]+url="([^"]+)"/i,
    /<img[^>]+src="([^"]+)"/i,
  ]
  for (const re of patterns) {
    const m = block.match(re)
    if (m?.[1]) {
      return m[1].trim().startsWith('//') ? `https:${m[1].trim()}` : m[1].trim()
    }
  }
  return null
}

function parseRss(xml: string, fallbackSource = 'Google News'): Article[] {
  const items: Article[] = []
  const itemRe = /<item>([\s\S]*?)<\/item>/g
  let m: RegExpExecArray | null
  while ((m = itemRe.exec(xml)) !== null) {
    const block = decodeEntities(m[1])
    const title = stripTags(block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '')
    const link = decodeEntities(
      block.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1]?.trim() ||
        block.match(/<link[^>]*href="([^"]*)"/)?.[1] ||
        ''
    )
    const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || ''
    const desc = stripTags(block.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '')
    const sourceName =
      stripTags(block.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]?.trim() || '') || fallbackSource

    if (!title || title === 'Google समाचार' || title.includes('Google News')) continue
    if (!link) continue

    const relevance = 2 + scoreArticle(title, desc)
    items.push({
      title,
      description: desc || title,
      url: link,
      urlToImage: extractItemImage(block),
      source: { name: sourceName },
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      relevance,
    })
  }
  return items
}

async function fetchFeed(url: string, fallbackSource = 'Google News'): Promise<Article[]> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA },
    redirect: 'follow',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Feed failed: ${res.status}`)
  const xml = await res.text()
  return parseRss(xml, fallbackSource)
}

// Interleave image and text items so the feed never reads as a uniform template:
// when both pools have content they alternate, otherwise the remaining pool fills.
function balanceDeck(items: Article[], limit: number): Article[] {
  const withImg = items.filter((a) => a.urlToImage)
  const text = items.filter((a) => !a.urlToImage)
  const deck: Article[] = []
  let i = 0
  let j = 0
  while (deck.length < limit && (i < withImg.length || j < text.length)) {
    if (i < withImg.length && (j >= text.length || i <= j + 1)) deck.push(withImg[i++])
    else if (j < text.length) deck.push(text[j++])
    else if (i < withImg.length) deck.push(withImg[i++])
    else break
  }
  return deck
}

export async function GET() {
  // Serve from the in-memory cache when it's still fresh.
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({
      articles: cache.articles,
      cached: true,
      fetchedAt: cache.fetchedAt,
    })
  }

  // Fetch curated Hindi search feeds + image-bearing publisher feeds in parallel,
  // then rank by keyword relevance and interleave image/text into a varied deck.
  try {
    const results = await Promise.allSettled([
      ...FEEDS.map((t) => fetchFeed(googleNewsRss(t))),
      ...IMAGE_FEEDS.map((u) => fetchFeed(u, sourceLabel(u))),
    ])

    const articles: Article[] = []
    const seen = new Set<string>()

    for (const r of results) {
      if (r.status !== 'fulfilled') continue
      for (const a of r.value) {
        const key = normalizeTitle(a.title)
        if (!key || seen.has(key)) continue
        // Image items pass a slightly lower bar so the section keeps photos even
        // when the curated Google set is thin.
        const min = a.urlToImage ? 3 : 4
        if (a.relevance < min) continue
        seen.add(key)
        articles.push(a)
      }
    }

    articles.sort((a, b) => {
      const rel = b.relevance - a.relevance
      if (rel !== 0) return rel
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })

    if (articles.length === 0) {
      return NextResponse.json({ articles: [], error: 'No articles available' })
    }

    const top = balanceDeck(articles, 30)
    cache = { articles: top, fetchedAt: Date.now() }
    return NextResponse.json({ articles: cache.articles, cached: false })
  } catch (err) {
    // If the cache holds a previous successful result, degrade to it on error
    // rather than failing the page.
    if (cache) {
      console.error('News aggregation error (serving stale cache):', err)
      return NextResponse.json({
        articles: cache.articles,
        cached: true,
        stale: true,
      })
    }
    console.error('News aggregation error:', err)
    return NextResponse.json(
      { articles: [], error: 'Failed to load news, please try again later.' },
      { status: 500 }
    )
  }
}