import 'dotenv/config'
import express from 'express'
import nodemailer from 'nodemailer'
import fs from 'node:fs'

const {
  SMTP_HOST, SMTP_PORT = 587, SMTP_USER, SMTP_PASS,
  FROM = 'Fursa <no-reply@fursa.example>', SUPPORT_EMAIL = 'support@fursa.example',
  SITE_URL = 'http://localhost:5173', PORT = 3001,
} = process.env

const mailer = SMTP_HOST
  ? nodemailer.createTransport({ host: SMTP_HOST, port: +SMTP_PORT, secure: +SMTP_PORT === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } })
  : null

async function send(to, subject, html, text, replyTo) {
  if (!mailer) { console.log(`\n[email NOT sent: set SMTP_* in .env]\nTo: ${to}\nSubject: ${subject}\n${text}\n`); return }
  await mailer.sendMail({ from: FROM, to, subject, html, text, replyTo })
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  
// Email template: white card, #5098F1 header and button
const layout = ({ title, body, btn, url }) => `<!doctype html><html><body style="margin:0;background:#EAF3FE;font-family:Arial,Helvetica,sans-serif;color:#10233F">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#EAF3FE;padding:24px 12px"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden">
<tr><td style="background:#5098F1;padding:22px 28px;color:#ffffff;font-size:26px;font-weight:bold">Fursa.</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 14px;font-size:24px;line-height:1.25">${title}</h1>
<div style="font-size:16px;line-height:1.6">${body}</div>
${btn ? `<p style="margin:26px 0 8px"><a href="${url}" style="background:#5098F1;color:#ffffff;padding:13px 26px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">${btn}</a></p>` : ''}
</td></tr>
<tr><td style="padding:18px 28px;background:#F5F9FF;font-size:12px;color:#56688A">No ads. No data selling. Built for Lebanon.</td></tr>
</table></td></tr></table></body></html>`

const valid = e => typeof e === 'string' && e.length < 255 && /^\S+@\S+\.\S+$/.test(e)
const clean = e => String(e || '').trim().toLowerCase()
const wrap = fn => (req, res) => fn(req, res).catch(err => { console.error(err); res.status(500).json({ error: 'Could not send the email. Please try again later.' }) })

const app = express()
app.use(express.json({ limit: '10kb' }))

const hits = new Map() // simple rate limit: 12 requests/minute per IP
app.use('/api', (req, res, next) => {
  const now = Date.now(), a = (hits.get(req.ip) || []).filter(t => now - t < 60000)
  a.push(now); hits.set(req.ip, a)
  a.length > 12 ? res.status(429).json({ error: 'Too many requests. Please wait a minute.' }) : next()
})

app.post('/api/subscribe', wrap(async (req, res) => {
  const email = clean(req.body.email)
  if (!valid(email)) return res.status(400).json({ error: 'Enter a valid email.' })
  {
    await send(email, 'Welcome to Fursa 🎓',
      layout({
        title: 'Welcome to Fursa!',
        body: `<p>Thanks for staying in touch. Fursa brings free courses, training, internships and scholarships from NGOs in Lebanon into one place.</p>
<ul style="padding-left:20px"><li>Free for students, always</li><li>No ads, no data selling</li><li>New opportunities added every week</li></ul>
<p>Ready to start?</p>`,
        btn: 'Browse opportunities', url: `${SITE_URL}/#/opps`,
      }),
      `Welcome to Fursa! Free courses, training, internships and scholarships in Lebanon. Browse: ${SITE_URL}/#/opps`)
  }
  res.json({ ok: true })
}))

app.post('/api/contact', wrap(async (req, res) => {
  const { name = '', message = '', kind = 'contact' } = req.body, email = clean(req.body.email)
  if (!valid(email) || String(message).trim().length < 10) return res.status(400).json({ error: 'Please check your email and message.' })
  const label = kind === 'report' ? 'Problem report' : 'Support request'
  await send(SUPPORT_EMAIL, `[Fursa] ${label} from ${name || email}`,
    layout({ title: label, body: `<p><b>From:</b> ${esc(name)} &lt;${esc(email)}&gt;</p><p style="white-space:pre-wrap">${esc(message).slice(0, 4000)}</p>` }),
    `${label} from ${name} <${email}>\n\n${String(message).slice(0, 4000)}`, email)
  res.json({ ok: true })
}))

if (fs.existsSync('dist')) app.use(express.static('dist')) // serves the built site in production
app.listen(PORT, () => console.log(`Fursa API on http://localhost:${PORT}`))