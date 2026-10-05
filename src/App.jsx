import { useState, useEffect } from 'react'
import { supabase } from './supabase'

// ---------- Data (sample listings: replace with your database) ----------
const D=[
{id:1,t:'Web Development Bootcamp',org:'Beirut Digital Lab',c:'Course',loc:'Beirut / Online',dl:'2026-10-25',d:'Twelve free weekend sessions covering HTML, CSS and JavaScript.',l:'https://example.org/apply/web'},
{id:2,t:'Youth Leadership Training',org:'Cedar Youth Network',c:'Training',loc:'Tripoli',dl:'2026-10-18',d:'Three-day workshop on teamwork, public speaking and project planning.',l:'https://example.org/apply/leadership'},
{id:3,t:'Summer Program Internship',org:'Green Lebanon',c:'Internship',loc:'Saida',dl:'2026-11-10',d:'Support field teams on reforestation and community awareness campaigns.',l:'https://example.org/apply/intern'},
{id:4,t:'Undergraduate Merit Scholarship',org:'Rise Foundation',c:'Scholarship',loc:'Anywhere in Lebanon',dl:'2026-12-01',d:'Covers tuition for students with strong grades and financial need.',l:'https://example.org/apply/scholar'},
{id:5,t:'English for Work',org:'Bekaa Learning Hub',c:'Course',loc:'Zahle',dl:'2026-10-30',d:'Free B1–B2 English classes focused on interviews and workplace writing.',l:'https://example.org/apply/english'},
{id:6,t:'Data Analysis with Excel',org:'Beirut Digital Lab',c:'Training',loc:'Online',dl:'2026-11-05',d:'Learn pivot tables, charts and basic dashboards in four evenings.',l:'https://example.org/apply/excel'},
{id:7,t:'NGO Communications Internship',org:'Cedar Youth Network',c:'Internship',loc:'Beirut',dl:'2026-11-20',d:'Help write stories and manage social media for youth programs.',l:'https://example.org/apply/comms'},
{id:8,t:'Women in STEM Scholarship',org:'Rise Foundation',c:'Scholarship',loc:'Anywhere in Lebanon',dl:'2026-12-15',d:'Financial support for female students in science and engineering.',l:'https://example.org/apply/stem'}];
const COL=['#5098F1','#2A6BC9','#3B82F6','#1E3A8A','#0EA5E9'];
const ORGS=[...new Set(D.map(x=>x.org))];

// ---------- Translations ----------
const AR={about:'من نحن',privacy:'الخصوصية',terms:'الشروط',contact:'اتصل بنا',home:'الرئيسية',opps:'الفرص',signin:'تسجيل الدخول',settings:'الإعدادات',
h1:'كل الفرص المجانية للطلاب في لبنان، في مكان واحد',sub:'دورات وتدريب وتدريب عملي ومنح من الجمعيات، دون البحث في صفحات فيسبوك.',browse:'تصفّح الفرص',
how:'كيف يعمل',s1:'تصفّح',s1d:'اعثر على فرصة تناسبك.',s2:'اقرأ التفاصيل',s2d:'الموعد النهائي والموقع وشروط التقديم.',s3:'قدّم مباشرة',s3d:'اذهب إلى رابط الجمعية للتسجيل.',
feat:'دورات مميزة',nw:'أحدث الفرص',partners:'جمعيات شريكة',ftag:'بلا إعلانات. بلا بيع للبيانات. صُنع للبنان.',fnote:'مجاني للطلاب دائماً.',
lang:'اللغة',dark:'الوضع الداكن',fs:'حجم الخط',notif:'إشعارات البريد',logout:'تسجيل الخروج',deadline:'الموعد النهائي',apply:'سجّل الآن',
oL:'فرصة منشورة',sL:'طالب مسجّل',pL:'جمعية شريكة',aL:'الإعلانات والتكلفة'};
const EN={home:'Home',opps:'Opportunities',signin:'Sign in',settings:'Settings',about:'About us',privacy:'Privacy',terms:'Terms',contact:'Contact',
h1:'Every free opportunity for students in Lebanon, in one place',sub:'Courses, training, internships and scholarships from NGOs. No more searching across Facebook pages.',browse:'Browse opportunities',
how:'How it works',s1:'Browse',s1d:'Find an opportunity that fits you.',s2:'Read the details',s2d:'Deadline, location and requirements.',s3:'Apply directly',s3d:'Register on the NGO’s own link.',
feat:'Featured',nw:'New this week',partners:'Partner NGOs',ftag:'No ads. No data selling. Built for Lebanon.',fnote:'Always free for students.',
lang:'Language',dark:'Dark mode',fs:'Font size',notif:'Email notifications',logout:'Log out',deadline:'Deadline',apply:'Register now',
oL:'Opportunities listed',sL:'Students registered',pL:'Partner NGOs',aL:'Ads and cost'};

// ---------- Styles ----------
const CSS = `
:root{--bg:#FFFFFF;--card:#FFFFFF;--ink:#10233F;--mute:#56688A;--line:#E1E9F5;--g:#5098F1;--gs:#EAF3FE;--r:#2A6BC9;--fs:16px;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
:root[data-theme="dark"]{--bg:#0B1226;--card:#131C36;--ink:#E8EEFF;--mute:#9AAAD0;--line:#24304F;--g:#5098F1;--gs:#16244A;--r:#8DBBF7}
*{box-sizing:border-box}html{background:#fff;scroll-padding-top:env(safe-area-inset-top,0px);font-size:var(--fs)}
body{margin:0;background:var(--bg);color:var(--ink);font-family:'Plus Jakarta Sans',system-ui,'Segoe UI',Tahoma,sans-serif;line-height:1.55}
a{color:inherit}button,input,select{font:inherit;color:inherit}
:focus-visible{outline:3px solid var(--g);outline-offset:2px}
.w{max-width:1040px;margin:0 auto;padding:0 20px}
header{background:var(--card);border-bottom:1px solid var(--line);position:sticky;top:env(safe-area-inset-top,0px);z-index:5}
header .w{display:flex;align-items:center;gap:20px;height:60px}
.logo{font-weight:800;font-size:1.3rem;text-decoration:none;color:var(--g);letter-spacing:-.02em}.logo i{color:var(--r);font-style:normal}
nav{display:flex;gap:6px;margin-inline-start:auto;align-items:center;flex-wrap:wrap}
nav a{padding:6px 12px;border-radius:8px;text-decoration:none;color:var(--mute);font-weight:500}
nav a:hover,nav a.on{background:var(--gs);color:var(--g)}
.btn{display:inline-block;border:0;background:var(--g);color:#fff;padding:10px 18px;border-radius:8px;font-weight:700;text-decoration:none;cursor:pointer}
:root[data-theme="dark"] .btn{color:#0B1226}
.btn.o{background:none;border:1.5px solid var(--g);color:var(--g)}.btn.d{background:#D93025;color:#fff!important}
h1{font-size:clamp(2rem,5vw,3.2rem);line-height:1.1;letter-spacing:-.03em;margin:0 0 14px;font-weight:800}
h2{font-size:1.5rem;margin:0 0 16px;letter-spacing:-.02em}h3{margin:0 0 6px}
.hero{padding:56px 0 40px;display:grid;gap:24px;max-width:720px}.hero p{font-size:1.1rem;color:var(--mute);margin:0}
section{padding:28px 0}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:16px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px;display:flex;flex-direction:column;gap:8px;text-decoration:none;cursor:pointer}
.card:hover{border-color:var(--g)}.card p{margin:0;color:var(--mute);font-size:.93rem}
.tag{align-self:flex-start;font-size:.78rem;font-weight:700;background:var(--gs);color:var(--g);padding:2px 10px;border-radius:99px}
.meta{display:flex;gap:14px;flex-wrap:wrap;font-size:.85rem;margin-top:auto;padding-top:6px}.dl{color:var(--r);font-weight:700}
.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
.steps div{border-inline-start:3px solid var(--g);padding:4px 14px}.steps p{margin:0;color:var(--mute)}
.logos{display:flex;flex-wrap:wrap;gap:14px}
.lg{display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px 14px;font-weight:700;font-size:.9rem}
.lg b,.av{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:.8rem;flex:none}
.stats{background:var(--g);color:#fff;border-radius:14px;padding:22px;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;text-align:center;margin:20px 0}
:root[data-theme="dark"] .stats{color:#0B1226}
.stats b{display:block;font-size:2rem;line-height:1.1}
footer{background:var(--card);border-top:1px solid var(--line);margin-top:30px;padding:26px 0;color:var(--mute);font-size:.92rem}
footer .w{display:flex;flex-wrap:wrap;gap:14px 28px;justify-content:space-between}
footer nav{margin:0}footer nav a{padding:2px 8px}
.bar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px}
.bar input,.bar select,.f input,.f select,.row select{background:var(--card);border:1.5px solid var(--line);border-radius:8px;padding:10px 12px}
.bar input{flex:1;min-width:200px}
.f{max-width:400px;margin:40px auto;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:26px;display:grid;gap:12px}
.f label{font-weight:500;font-size:.9rem;display:grid;gap:4px}.f .lk{color:var(--g);cursor:pointer;background:none;border:0;padding:0;text-align:start;font-weight:500}
.msg{font-size:.9rem;color:#D93025}.ok{color:var(--g)}
.tabs{display:flex;gap:6px}.tabs button{flex:1;padding:8px;border:1.5px solid var(--line);background:none;border-radius:8px;cursor:pointer;font-weight:700}.tabs .on{background:var(--gs);border-color:var(--g);color:var(--g)}
.set{max-width:640px;margin:30px auto;display:grid;gap:16px}
.box{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:6px 18px}
.box h3{padding-top:12px;font-size:.95rem;color:var(--mute)}
.row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--line)}.row:last-child{border:0}
.row a{color:var(--g);font-weight:500}
.sw{width:44px;height:26px;border-radius:99px;background:var(--line);border:0;position:relative;cursor:pointer;flex:none}
.sw::after{content:"";position:absolute;top:3px;inset-inline-start:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:.15s}
.sw[aria-checked=true]{background:var(--g)}.sw[aria-checked=true]::after{inset-inline-start:21px}
.det{max-width:720px;margin:30px auto}.det dl{display:grid;grid-template-columns:auto 1fr;gap:6px 18px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;margin:16px 0}
.det dt{color:var(--mute)}.det dd{margin:0;font-weight:700}
.crumb{color:var(--g);text-decoration:none;font-weight:500}
:root[data-theme="dark"] .btn.o{color:var(--g)}
.f textarea{background:var(--card);border:1.5px solid var(--line);border-radius:8px;padding:10px 12px;min-height:120px;resize:vertical;width:100%}
.stay{background:var(--gs);border-radius:14px;padding:24px;display:grid;gap:12px;margin:10px 0}.stay p{margin:0;color:var(--mute)}
.stay form{display:flex;gap:10px;flex-wrap:wrap}.stay input{flex:1;min-width:220px;background:var(--card);border:1.5px solid var(--line);border-radius:8px;padding:10px 12px}
.faq{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px 16px;margin:10px 0}.faq summary{cursor:pointer;font-weight:700}.faq p{color:var(--mute);margin:8px 0 0}
@media(max-width:640px){header .w{height:auto;padding:10px 20px;flex-wrap:wrap}nav{margin:0}}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
`

// ---------- App ----------

const ls = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } }
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

const api = async (path, body) => {
  const r = await fetch('/api/' + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || 'Something went wrong. Please try again.')
  return j
}

function useHash() {
  const [h, setH] = useState(location.hash)
  useEffect(() => {
    const f = () => { setH(location.hash); scrollTo(0, 0) }
    addEventListener('hashchange', f)
    return () => removeEventListener('hashchange', f)
  }, [])
  return h.replace('#/', '') || 'home'
}

export default function App() {
  const [P, setP] = useState(() => ls('p', { lang: 'en', theme: 'light', fs: 16, mail: true }))
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(null)
  const [opps, setOpps] = useState(D)
  const [stats, setStats] = useState(null)
  const [r, id] = useHash().split('/')

  const me = session ? { id: session.user.id, email: session.user.email, name: profile?.full_name || session.user.email.split('@')[0], pic: profile?.avatar_url } : null
  const T = k => (P.lang === 'ar' ? AR : EN)[k] || EN[k]
  const dt = s => new Date(s).toLocaleDateString(P.lang === 'ar' ? 'ar-LB' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  useEffect(() => {
    save('p', P)
    const el = document.documentElement
    el.lang = P.lang
    el.dir = P.lang === 'ar' ? 'rtl' : 'ltr'
    P.theme === 'dark' ? el.setAttribute('data-theme', 'dark') : el.removeAttribute('data-theme')
    el.style.setProperty('--fs', P.fs + 'px')
  }, [P])
  useEffect(() => { if (r === 'settings' && session === null) location.hash = '#/auth' }, [r, session])
  useEffect(() => {
    if (!supabase) { setSession(null); return }
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((ev, s) => { setSession(s); if (ev === 'PASSWORD_RECOVERY') location.hash = '#/reset' })
    return () => data.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!supabase) return
    supabase.from('opportunities').select('id,title,category,description,location,deadline,apply_url,organizations(name)').order('deadline')
      .then(({ data }) => data?.length && setOpps(data.map(o => ({ id: o.id, t: o.title, org: o.organizations.name, c: o.category, loc: o.location, dl: o.deadline, d: o.description, l: o.apply_url }))))
    supabase.rpc('get_stats').then(({ data }) => data && setStats(data))
  }, [])
  useEffect(() => {
    if (!supabase || !session) { setProfile(null); return }
    supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => setProfile(data))
  }, [session])

  const ctx = { T, dt, P, setP, me, setProfile, opps, stats }
  const pages = {
    home: <Home {...ctx} />, opps: <Opps {...ctx} />, course: <Course {...ctx} id={id} />,
    auth: <Auth {...ctx} />, settings: me ? <Settings {...ctx} /> : null,
    about: <Page h="About us" t="Fursa connects students in Lebanon with free courses, training, internships and scholarships from NGOs. Students always stay free." />,
    privacy: <Page h="Privacy" t="We collect only what we need to run your account. We never sell your data and we show no ads. You can delete your account any time from Settings." />,
    terms: <Page h="Terms" t="Fursa lists opportunities posted by third-party NGOs. Applications happen on the NGO's own link. Check deadlines with the NGO before applying." />,
    contact: <ContactForm kind="contact" />,
    report: <ContactForm kind="report" />,
    help: <Help />,
    reset: <Reset />,
  }

  return (
    <>
      <style>{CSS}</style>
      <header><div className="w">
        <a className="logo" href="#/">Fursa<i>.</i></a>
        <nav>
          <a href="#/" className={r === 'home' ? 'on' : ''}>{T('home')}</a>
          <a href="#/opps" className={r === 'opps' ? 'on' : ''}>{T('opps')}</a>
          {me ? <a href="#/settings" className={r === 'settings' ? 'on' : ''}>{T('settings')}</a>
              : <a className="btn" href="#/auth">{T('signin')}</a>}
        </nav>
      </div></header>
      <main className="w">{pages[r] || pages.home}</main>
      <footer><div className="w">
        <div><b>{T('ftag')}</b><br />{T('fnote')}</div>
        <nav aria-label="Footer">
          {['about', 'privacy', 'terms', 'contact'].map(k => <a key={k} href={'#/' + k}>{T(k)}</a>)}
          <a href="https://facebook.com" rel="noopener">Facebook</a>
          <a href="https://instagram.com" rel="noopener">Instagram</a>
          <a href="https://linkedin.com" rel="noopener">LinkedIn</a>
        </nav>
      </div></footer>
    </>
  )
}

const Page = ({ h, t }) => <div className="det"><h1 style={{ fontSize: '2rem' }}>{h}</h1><p>{t}</p></div>

const Card = ({ o, T, dt }) => (
  <a className="card" href={'#/course/' + o.id}>
    <span className="tag">{o.c}</span><h3>{o.t}</h3><p>{o.d}</p>
    <div className="meta"><span>📍 {o.loc}</span><span className="dl">{T('deadline')}: {dt(o.dl)}</span></div>
  </a>
)

const OrgLogo = ({ n, i }) => (
  <div className="lg">
    <b style={{ background: COL[i % 5] }}>{n.split(' ').map(w => w[0]).slice(0, 2).join('')}</b>{n}
  </div>
)

function Home({ T, dt, opps, stats }) {
  const orgs = [...new Set(opps.map(o => o.org))]
  const st = stats || { opportunities: opps.length, students: 0, partners: orgs.length }
  const steps = [['s1', 's1d'], ['s2', 's2d'], ['s3', 's3d']]
  return (
    <>
      <div className="hero"><h1>{T('h1')}</h1><p>{T('sub')}</p><div><a className="btn" href="#/opps">{T('browse')}</a></div></div>
      <section><h2>{T('how')}</h2>
        <div className="steps">{steps.map(([a, b], i) => <div key={a}><h3>{i + 1}. {T(a)}</h3><p>{T(b)}</p></div>)}</div>
      </section>
      <section><h2>{T('feat')}</h2><div className="grid">{opps.slice(0, 3).map(o => <Card key={o.id} o={o} T={T} dt={dt} />)}</div></section>
      <section><h2>{T('nw')}</h2><div className="grid">{opps.slice(-3).map(o => <Card key={o.id} o={o} T={T} dt={dt} />)}</div></section>
      <section><h2>{T('partners')}</h2><div className="logos">{orgs.map((n, i) => <OrgLogo key={n} n={n} i={i} />)}</div></section>
      <StayInTouch />
      <div className="stats">
        <div><b>{st.opportunities}</b>{T('oL')}</div><div><b>{st.students}</b>{T('sL')}</div>
        <div><b>{st.partners}</b>{T('pL')}</div><div><b>$0</b>{T('aL')}</div>
      </div>
    </>
  )
}

function Opps({ T, dt, opps }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const cats = ['All', ...new Set(opps.map(x => x.c))]
  const list = opps.filter(o => (cat === 'All' || o.c === cat) && (o.t + o.org + o.loc).toLowerCase().includes(q.toLowerCase()))
  return (
    <section><h2>{T('opps')}</h2>
      <div className="bar">
        <input type="search" placeholder="Search…" aria-label="Search" value={q} onChange={e => setQ(e.target.value)} />
        <select aria-label="Type" value={cat} onChange={e => setCat(e.target.value)}>{cats.map(c => <option key={c}>{c}</option>)}</select>
      </div>
      <div className="grid">{list.length ? list.map(o => <Card key={o.id} o={o} T={T} dt={dt} />) : <p>No matches. Try another word or type.</p>}</div>
    </section>
  )
}

function Course({ T, dt, id, opps }) {
  const o = opps.find(x => x.id === +id)
  if (!o) return <p>Not found. <a href="#/opps">Back</a></p>
  return (
    <div className="det">
      <a className="crumb" href="#/opps">← {T('opps')}</a>
      <h1 style={{ fontSize: '2rem', marginTop: 14 }}>{o.t}</h1>
      <span className="tag">{o.c}</span><p>{o.d}</p>
      <dl><dt>NGO</dt><dd>{o.org}</dd><dt>{T('deadline')}</dt><dd className="dl">{dt(o.dl)}</dd><dt>Location</dt><dd>{o.loc}</dd></dl>
      <a className="btn" href={o.l} target="_blank" rel="noopener noreferrer">{T('apply')}</a>
    </div>
  )
}

function Auth() {
  const [mode, setMode] = useState('in')
  const [f, setF] = useState({ n: '', e: '', p: '' })
  const [msg, setMsg] = useState({ t: '', ok: false })
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const say = (t, ok = false) => setMsg({ t, ok })
  const ready = () => supabase || (say('Connect Supabase first (see README).'), false)

  async function submit() {
    if (!ready()) return
    const e = f.e.trim().toLowerCase()
    if (!/\S+@\S+\.\S+/.test(e)) return say('Enter a valid email.')
    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(e, { redirectTo: location.origin })
      return error ? say(error.message) : say('If this email is registered, a reset link is on its way. Check your inbox.', true)
    }
    if (f.p.length < 8) return say('Password must be at least 8 characters.')
    if (mode === 'up') {
      if (!f.n.trim()) return say('Enter your name.')
      const { data, error } = await supabase.auth.signUp({ email: e, password: f.p, options: { data: { full_name: f.n.trim() }, emailRedirectTo: location.origin } })
      if (error) return say(error.message)
      return data.session ? (location.hash = '#/settings') : say('Check your email to confirm your account, then sign in.', true)
    }
    const { error } = await supabase.auth.signInWithPassword({ email: e, password: f.p })
    error ? say('Email or password is incorrect.') : (location.hash = '#/settings')
  }
  async function google() {
    if (!ready()) return
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + '/#/settings' } })
    if (error) say(error.message)
  }

  const go = m => { setMode(m); say('') }
  return (
    <div className="f">
      <div className="tabs">
        <button className={mode === 'in' ? 'on' : ''} onClick={() => go('in')}>Sign in</button>
        <button className={mode === 'up' ? 'on' : ''} onClick={() => go('up')}>Sign up</button>
      </div>
      {mode === 'forgot' && <p>Enter your email and we'll send a reset link.</p>}
      {mode === 'up' && <label>Name<input value={f.n} onChange={set('n')} autoComplete="name" /></label>}
      <label>Email<input type="email" value={f.e} onChange={set('e')} autoComplete="email" /></label>
      {mode !== 'forgot' && <label>Password<input type="password" value={f.p} onChange={set('p')} autoComplete="current-password" /></label>}
      <button className="btn" onClick={submit}>{mode === 'in' ? 'Sign in' : mode === 'up' ? 'Create account' : 'Send reset link'}</button>
      {mode === 'in' && <button className="lk" onClick={() => go('forgot')}>Forgot password?</button>}
      {mode === 'forgot' && <button className="lk" onClick={() => go('in')}>Back to sign in</button>}
      <button className="btn o" onClick={google}>Continue with Google</button>
      <p className={'msg' + (msg.ok ? ' ok' : '')} role="alert">{msg.t}</p>
    </div>
  )
}

const Switch = ({ on, onClick }) => <button className="sw" role="switch" aria-checked={on} onClick={onClick} />

function Settings({ T, P, setP, me, setProfile }) {
  const [msg, setMsg] = useState('')
  const pic = async e => {
    const file = e.target.files[0]
    if (!file) return
    const path = `${me.id}/avatar`
    const up = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type })
    if (up.error) return setMsg(up.error.message)
    const url = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl + '?v=' + Date.now()
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', me.id)
    setProfile(p => ({ ...p, avatar_url: url }))
  }
  const toggleMail = async () => {
    const v = !P.mail
    setP({ ...P, mail: v })
    await supabase.from('profiles').update({ email_notifications: v }).eq('id', me.id)
  }
  const changePw = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(me.email, { redirectTo: location.origin })
    setMsg(error ? error.message : 'We sent a password reset link to ' + me.email + '. Open it to choose a new password.')
  }
  const logout = async () => { await supabase.auth.signOut(); location.hash = '#/' }
  const del = async () => {
    if (!confirm('Delete your account permanently?')) return
    const { error } = await supabase.rpc('delete_my_account')
    if (error) return setMsg(error.message)
    await supabase.auth.signOut(); location.hash = '#/'
  }

  return (
    <div className="set">
      <div className="box"><div className="row">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label className="av" style={{ background: 'var(--g)', cursor: 'pointer', width: 52, height: 52, overflow: 'hidden' }} title="Change photo">
            {me.pic ? <img src={me.pic} width="52" height="52" alt="" /> : me.name[0].toUpperCase()}
            <input type="file" accept="image/*" hidden onChange={pic} />
          </label>
          <div><b>{me.name}</b><br /><small>{me.email}</small></div>
        </div>
        <button className="btn o" onClick={logout}>{T('logout')}</button>
      </div></div>

      <div className="box"><h3>Preferences</h3>
        <div className="row">{T('dark')}<Switch on={P.theme === 'dark'} onClick={() => setP({ ...P, theme: P.theme === 'dark' ? 'light' : 'dark' })} /></div>
        <div className="row">{T('lang')}
          <select value={P.lang} onChange={e => setP({ ...P, lang: e.target.value })}><option value="en">English</option><option value="ar">العربية</option></select></div>
        <div className="row">{T('fs')}
          <select value={P.fs} onChange={e => setP({ ...P, fs: +e.target.value })}><option value="14">Small</option><option value="16">Medium</option><option value="19">Large</option></select></div>
        <div className="row">{T('notif')}<Switch on={P.mail} onClick={toggleMail} /></div>
      </div>

      <div className="box"><h3>Account</h3>
        <div className="row">Change password<button className="btn o" onClick={changePw}>Send reset email</button></div>
        <div className="row">Delete account<button className="btn d" onClick={del}>Delete</button></div>
      </div>

      <div className="box"><h3>Support</h3>
        <div className="row"><a href="#/help">Help center</a></div>
        <div className="row"><a href="#/contact">Contact support</a></div>
        <div className="row"><a href="#/report">Report a problem</a></div>
      </div>
      <p className="msg ok" role="status">{msg}</p>
    </div>
  )
}

function StayInTouch() {
  const [email, setEmail] = useState('')
  const [st, setSt] = useState({ t: '', ok: false })
  const [busy, setBusy] = useState(false)
  async function go(e) {
    e.preventDefault()
    setBusy(true)
    try {
      let isNew = true
      if (supabase) {
        const { error } = await supabase.from('subscribers').insert({ email: email.trim().toLowerCase() })
        if (error && error.code === '23505') isNew = false
        else if (error) throw new Error('Could not subscribe. Please try again.')
      }
      if (isNew) await api('subscribe', { email })
      setSt({ t: isNew ? 'Thank you! A welcome email is on its way.' : 'You are already subscribed. Thank you!', ok: true }); setEmail('')
    }
    catch (err) { setSt({ t: err.message, ok: false }) }
    setBusy(false)
  }
  return (
    <section className="stay">
      <h2 style={{ margin: 0 }}>Stay in touch</h2>
      <p>Get new courses, internships and scholarships in your inbox. Free, no spam.</p>
      <form onSubmit={go}>
        <input type="email" required placeholder="Your email" aria-label="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <button className="btn" disabled={busy}>{busy ? 'Sending…' : 'Subscribe'}</button>
      </form>
      <p className={'msg' + (st.ok ? ' ok' : '')} role="status">{st.t}</p>
    </section>
  )
}

function ContactForm({ kind }) {
  const [f, setF] = useState({ name: '', email: '', message: '' })
  const [st, setSt] = useState({ t: '', ok: false })
  const [busy, setBusy] = useState(false)
  const set = k => e => setF({ ...f, [k]: e.target.value })
  async function send() {
    if (!/\S+@\S+\.\S+/.test(f.email)) return setSt({ t: 'Enter a valid email.', ok: false })
    if (f.message.trim().length < 10) return setSt({ t: 'Please write a few more words.', ok: false })
    setBusy(true)
    try { if (supabase) await supabase.from('support_messages').insert({ kind, name: f.name, email: f.email, message: f.message }); await api('contact', { ...f, kind }); setSt({ t: 'Thanks! We got your message and will reply by email.', ok: true }); setF({ name: '', email: '', message: '' }) }
    catch (err) { setSt({ t: err.message, ok: false }) }
    setBusy(false)
  }
  return (
    <div className="f">
      <h2 style={{ margin: 0 }}>{kind === 'report' ? 'Report a problem' : 'Contact support'}</h2>
      <label>Name<input value={f.name} onChange={set('name')} autoComplete="name" /></label>
      <label>Email<input type="email" value={f.email} onChange={set('email')} autoComplete="email" /></label>
      <label>{kind === 'report' ? 'What went wrong?' : 'How can we help?'}<textarea value={f.message} onChange={set('message')} /></label>
      <button className="btn" onClick={send} disabled={busy}>{busy ? 'Sending…' : 'Send'}</button>
      <p className={'msg' + (st.ok ? ' ok' : '')} role="status">{st.t}</p>
    </div>
  )
}

function Help() {
  const qa = [
    ['Is Fursa really free?', 'Yes. Students never pay, and there are no ads. NGOs list their programs for free for now.'],
    ['How do I apply to an opportunity?', 'Open the opportunity and press Register now. You apply on the NGO\'s own page.'],
    ['I forgot my password.', 'Go to Sign in, choose Forgot password, and we will email you a link to set a new one.'],
    ['How do I delete my account?', 'Open Settings, then Account, then Delete. This cannot be undone.'],
    ['I am an NGO. How do I list a program?', 'Write to us from the contact page and we will add it.'],
  ]
  return (
    <div className="det">
      <h1 style={{ fontSize: '2rem' }}>Help center</h1>
      {qa.map(([q, a]) => <details key={q} className="faq"><summary>{q}</summary><p>{a}</p></details>)}
      <p>Still stuck? <a className="crumb" href="#/contact">Contact support</a></p>
    </div>
  )
}

function Reset() {
  const [pw, setPw] = useState('')
  const [msg, setMsg] = useState('')
  const [done, setDone] = useState(false)
  async function submit() {
    if (pw.length < 8) return setMsg('Password must be at least 8 characters.')
    const { error } = await supabase.auth.updateUser({ password: pw })
    error ? setMsg('This link is invalid or expired. Request a new reset email.') : setDone(true)
  }
  if (done) return <div className="f"><p className="ok">Your password was changed.</p><a className="btn" href="#/settings">Continue</a></div>
  return (
    <div className="f">
      <h2 style={{ margin: 0 }}>Choose a new password</h2>
      <label>New password<input type="password" value={pw} onChange={e => setPw(e.target.value)} autoComplete="new-password" /></label>
      <button className="btn" onClick={submit}>Change password</button>
      <p className="msg" role="alert">{msg}</p>
    </div>
  )
}