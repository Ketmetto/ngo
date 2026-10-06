// Pulls listings from NGO websites into Supabase.  Run: npm run scrape
// Needs SUPABASE_SERVICE_ROLE_KEY in .env (server-only key: never prefix it with VITE_)
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const { VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
if (!VITE_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) { console.error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env'); process.exit(1) }
const db = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', '#039': "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—' }
const text = h => h.replace(/<[^>]+>/g, ' ').replace(/&(#?\w+);/g, (m, e) => ENT[e] ?? (e[0] === '#' ? String.fromCodePoint(+e.slice(1)) : m))
  .split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n')
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Each source: the NGO, the page to read, and parse(html) -> [{ title, description, category, location, deadline?, apply_url? }]
const SOURCES = [
  {
    org: 'DOT Lebanon', website: 'https://lebanon.dotrust.org',
    url: 'https://lebanon.dotrust.org/current-projects/',
    parse(html) {
      const section = html.split(/<span>\s*Current Projects\s*<\/span>/).at(-1).split('</section>')[0] || ''
      return [...section.matchAll(/<p class="h4">([\s\S]*?)<\/p>\s*<p[^>]*>([\s\S]*?)<\/p>/g)].map(([, t, d]) => ({
        title: text(t), description: text(d), category: 'Training', location: 'Lebanon',
      }))
    },
  },
]

async function run(src) {
  const res = await fetch(src.url, { headers: { 'User-Agent': 'FursaBot/1.0 (+free student opportunities in Lebanon)' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const items = src.parse(await res.text()).filter(i => i.title && i.description)
  if (!items.length) throw new Error('no listings found: the page layout probably changed') // don't unpublish everything on a broken parse

  const { data: org, error: oe } = await db.from('organizations')
    .upsert({ name: src.org, website: src.website }, { onConflict: 'name' }).select('id').single()
  if (oe) throw oe

  const rows = items.map(i => ({
    org_id: org.id, title: i.title, description: i.description, category: i.category, location: i.location,
    deadline: i.deadline || null, apply_url: i.apply_url || src.url,
    source_url: `${src.url}#${slug(i.title)}`, published: true,
  }))
  const { error } = await db.from('opportunities').upsert(rows, { onConflict: 'source_url' })
  if (error) throw error

  // Hide listings this page no longer shows
  const keep = rows.map(r => r.source_url)
  const { data: gone, error: ge } = await db.from('opportunities').update({ published: false })
    .like('source_url', `${src.url}#%`).not('source_url', 'in', `(${keep.map(u => `"${u}"`).join(',')})`).select('title')
  if (ge) throw ge
  console.log(`✓ ${src.org}: ${rows.length} listings${gone.length ? `, ${gone.length} unpublished` : ''}`)
  rows.forEach(r => console.log('   -', r.title))
}

let failed = 0
for (const src of SOURCES) await run(src).catch(e => { failed++; console.error(`✗ ${src.org}: ${e.message}`) })
process.exit(failed ? 1 : 0)
