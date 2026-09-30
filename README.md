# AURAVEX

A premium enterprise-software portfolio site with its own command centre.
Next.js 15 (App Router), React 19, Tailwind 4, framer-motion, and a Node
backend on SQLite — no external database, no daemon, one folder of data.

## Run it

```bash
npm install
npm run preview        # next build && next start  (production, port 3000)
npx next start -p 3111 # or any port, after a build
```

Development server: `npm run dev`. Pages take a few seconds the first time
in dev because they compile on demand; the production build is what the
site actually feels like.

Node **22.5 or newer** is required (the database uses the built-in
`node:sqlite`). Node 24 is what it was built on.

## First sign-in

Open `/admin/login`. With no `.env`, the first start creates a demo account:

```
admin@auravex.com / auravex2024
```

The login page offers these credentials only while that password is still in
force, and the first thing the portal does after that sign-in is ask for a new
password — nothing else works until it is set, because the demo password is
public. To skip the demo account entirely, set `ADMIN_EMAIL` and
`ADMIN_PASSWORD` in `.env` before the first start.

Lost the password later? Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` and
`ADMIN_RESET=1`, restart once, then remove `ADMIN_RESET`.

## Configuration

Copy `.env.example` to `.env`. Everything is optional; each missing piece is
stated in the portal at the point where it matters.

| Variable | What it enables |
| --- | --- |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The first account (otherwise the demo account). |
| `ANTHROPIC_API_KEY` | AI Studio jobs. Without it every job fails with a clear message. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Inbox replies emailed to the visitor; new enquiries and bookings forwarded to `ADMIN_EMAIL`. |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Web Push keys. Generated and stored automatically when blank. |
| `AURAVEX_DATA_DIR` | Where `auravex.db` and uploaded media live. Default `./data`. |
| `AURAVEX_TIMEZONE` | The zone bookings are made in (IANA name, e.g. `Asia/Dubai`); reminders are timed against it. Defaults to the machine's zone. |
| `AURAVEX_TRUST_PROXY` | Set to `1` only behind a reverse proxy that sets `X-Forwarded-For`/`X-Forwarded-Proto`. |
| `AURAVEX_ALLOW_INTERNAL_URLS` | Set to `1` only if a product to be filmed runs on this same machine or private network; otherwise such addresses are refused. |
| `ADMIN_RESET` | Set to `1` for one restart to reset the admin password from `.env`. |

The session cookie is marked `Secure` automatically when the request arrived
over https, so a plain-http address on a LAN still signs in.

## What the backend does

- **Content** — every edit made in the portal (copy, backgrounds, colours,
  products, case studies, page-builder blocks, logo, hero image) is stored in
  `settings` and served to visitors from `GET /api/site`. The browser keeps a
  cache in localStorage so a returning visitor paints the edited site before
  the network answers.
- **Media** — uploads are stored under `data/media` and served from
  `/api/media/<id>`; deleting one scrubs every reference to it.
- **Analytics** — every public page view posts a path, a source and a device
  class to `POST /api/track`. Nothing identifying is stored.
- **Inbox and leads** — the contact form creates a thread; replies are stored
  (and emailed when SMTP is set); each thread carries a pipeline stage shown
  under Demo Requests.
- **Bookings and reminders** — demo slots are stored with a lead time. The
  server sweeps them every minute and sends Web Push to every subscribed
  browser, so a reminder arrives even when the site is closed. The service
  worker keeps a local timer as a second line.
- **AI Studio** — three kinds of job, run by `src/server/ai.ts` with the
  Anthropic SDK (Claude Sonnet 5 by default):
  - *Change the site* — the model works the site through its own tools
    (copy, backgrounds, colours, products, page blocks). Every change is
    ledgered; Discard puts the site back exactly. Ambiguous requests come
    back as a question you answer in place, and a finished job can be
    carried on in the same conversation ("now make the title shorter"), with
    one Discard still reverting everything it did.
  - *Audit a product* — the agent signs in and uses the product like a
    careful first-time customer: every section, search, settings, phone
    width, links, console errors. It comes back with twelve scores that each
    carry their reasons, findings with screenshots as evidence, measured
    checks, and a verdict: ready to publish, review first, or not ready.
  - *Product film* — a headless Chrome signs in with a sealed credential,
    walks the product without ever pressing anything destructive, captures
    its real screens and a scrolling clip, the model writes the shot list,
    and the film is composed on a photographed set with the site's own
    typography and encoded to H.264 at 1080p or 4K (3840×2160), with an
    optional music bed. Three styles: showroom (a photographed set of your
    choosing), studio (a lit dark set) and screen recording (the screens full
    frame), picked in the composer or from your words. The result plays on
    the product page, where visitors can also set a meeting or, when a live
    demo address is configured for the product, try it themselves.
  - *Import a product* — the same walk, ending in a catalogue entry with the
    captured screens as its images, at its own `/products/<slug>`.
  Chrome is found on the machine (it uses the GPU when there is one; a 26 s
  film takes about two minutes at 1080p and five at 4K on a desktop, longer
  on a machine without a GPU); ffmpeg is bundled with `npm install`.
  Credentials are AES-256-GCM sealed under `data/secret.key` (or
  `AURAVEX_SECRET`); the model only ever sees field names, the browser types
  the values, and a password is only ever typed into a password box. The
  browser cannot pass a two-factor code or a CAPTCHA, so use an account
  without them for the walk. The browser is locked to the product's own site at the network layer — a link,
  redirect or form that leads elsewhere is refused, and the agent is told
  why. Addresses inside the server's own network are refused unless
  `AURAVEX_ALLOW_INTERNAL_URLS=1`. A job that fails, or is cut off by a
  restart, puts back whatever it had changed; a discarded job also removes
  the media it made. `AI_PROVIDER=mock` swaps the model for a scripted
  stand-in so the whole pipeline can be tested without a key.
- **Themes** — seventeen presets, or your own: pick any colours in Appearance,
  save them under a name, and make that theme what visitors see first. The
  public site and the portal each keep their own choice, so a dark portal
  never darkens the site for anyone else. Every text colour is kept readable
  automatically.
- **Connections** — the mail server and the Anthropic API key are typed into
  Settings and sealed on the server; `.env` still works as a fallback.
  Scheduled re-audits alert you (push and email) when a product's verdict moves.
- **Products** — the bundled catalogue can be edited field by field, and new
  products created in the portal are stored whole and get their own page at
  `/products/<slug>`.
- **Sessions, activity, links** — scrypt passwords, httpOnly cookie sessions,
  login throttling per client, per account and overall, an audit trail of
  every change, and tracked outbound links at `/go/<id>`.
- **Honest limits** — public forms are throttled per connection; uploads are
  type-checked by their bytes; SVGs are served with a script-blocking CSP.

## Layout

```
src/app/(site)      public pages
src/app/admin       the portal (login is outside the guarded group)
src/app/api         route handlers (public, auth, admin)
src/server          db, auth, site content, push, ai, mail
src/cms             the content store's React side
src/components      ui, sections, showcase devices, admin widgets
scripts             background plate generation
data/               runtime data (git-ignored)
```

## Backups

Everything lives in `data/`. Copy the folder while the server is stopped, or
copy `auravex.db`, `auravex.db-wal` and `media/` together.

## Deployment

Pushing to `main` deploys everything automatically:

- **Frontend** — Netlify site `auravex-site` (https://auravex-site.netlify.app), built on Netlify from this repo using `netlify.toml`. `/api/*` and `/go/*` are proxied to the backend.
- **Backend** — Render web service `auravex-api` (https://auravex-api.onrender.com), defined in `render.yaml`, auto-deploys on every commit.

Secrets (`MONGODB_URI`, `ADMIN_*`, `ANTHROPIC_API_KEY`, `AURAVEX_SECRET`) live only in the Render dashboard, never in this repo.
