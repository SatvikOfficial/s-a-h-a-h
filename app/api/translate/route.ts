import { NextRequest, NextResponse } from 'next/server'

// Free translation endpoint (no API key required).
// Uses the public Google Translate web endpoint with a graceful fallback.
// Accepts: { text, source: 'hi'|'en', target: 'hi'|'en' }
// Returns: { text }

export async function POST(req: NextRequest) {
  let body: { text?: string; source?: string; target?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const text = (body.text ?? '').toString().trim()
  if (!text) {
    return NextResponse.json({ text: '', source: body.source, target: body.target })
  }

  const source = body.source === 'en' ? 'en' : 'hi'
  const target = body.target === 'en' ? 'en' : 'hi'

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(
      text,
    )}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)

    if (!res.ok) throw new Error('Translate service not reachable')

    const json = (await res.json()) as unknown
    const segments = Array.isArray(json) && Array.isArray(json[0]) ? (json[0] as unknown[][]) : []
    const translated = segments
      .map((seg) => (typeof seg?.[0] === 'string' ? seg[0] : ''))
      .join('')

    if (!translated) throw new Error('Empty translation')

    return NextResponse.json({ text: translated, source, target })
  } catch (err) {
    // Fallback: return the original text so the admin can edit manually.
    console.error('Translate error:', err)
    return NextResponse.json({
      text,
      source,
      target,
      fallback: true,
    })
  }
}
