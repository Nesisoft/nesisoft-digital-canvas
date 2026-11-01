# Nesisoft — Digital Solutions for Africa

The marketing and content website for **Nesisoft**, a full-cycle software
development company building custom web, mobile, desktop, and IoT applications,
along with internal platforms like Agoo, Sua, Adesuapa, and Jua.

A monolith application with a React frontend and an Express + PostgreSQL API served
from the same domain. Public pages, `/admin`, and `/api/...` all deploy as one
Vercel project under `www.nesisoft.com` (the apex `nesisoft.com` redirects
there).

## Tech stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** with **shadcn/ui** (Radix primitives)
- **React Router** for client-side routing
- **TanStack Query** for data/state
- **react-hook-form** + **zod** for forms and validation
- **react-markdown** + **remark-gfm** for blog rendering
- **Express** + **PostgreSQL** ([Supabase](https://supabase.com), via `pg`) for
  the live blog, project, team and editable site content APIs
- **Supabase Storage** for images uploaded in `/admin`
- **express-session** + **connect-pg-simple** for admin sessions

## Getting started

The only requirement is Node.js & npm (or [bun](https://bun.sh)).

```sh
# Install dependencies
npm install

# Start the frontend and API together
npm run dev
```

Other scripts:

```sh
npm run build       # Production build → dist/
npm run build:dev   # Development-mode build
npm run preview     # Preview the production build locally
npm start           # Serve dist/ + API from Express after a build
npm run db:migrate  # Create/upgrade the database tables (+ the image bucket)
npm run seed        # Migrate, then fill an empty database from the site's content
npm run lint        # ESLint
npm run hash-password  # Prompt for the admin password, print ADMIN_PASSWORD_HASH
```

## Configuration

Copy `.env.example` to `.env.local` and fill in the values you need (both the
site and the API read it). All client-exposed variables must be prefixed with
`VITE_`.

| Variable | Purpose |
| --- | --- |
| `VITE_WEB3FORMS_ACCESS_KEY` | Contact-form and blog newsletter-signup delivery via [Web3Forms](https://web3forms.com); both arrive in the inbox tied to the key. Without it, the contact form falls back to opening the visitor's mail client and the newsletter signup is hidden. |
| `VITE_PLAUSIBLE_DOMAIN` | Privacy-friendly [Plausible](https://plausible.io) analytics. Leave blank to disable analytics. |
| `VITE_GROQ_API_KEY` | **Dev only.** Powers the AI Blog Studio at `/studio`. Must **not** be set for production builds — `VITE_` vars are embedded in the client bundle. |
| `DATABASE_URL` | PostgreSQL connection string for the API (Supabase: see [Database](#database-supabase)). Without it, data routes answer `503` at once and the public site uses its built-in content. |
| `DATABASE_CA_CERT` | Recommended in production. Supabase's CA certificate (PEM, from **Database Settings → SSL**) so the database's TLS certificate is verified; without it the connection is encrypted but unverified, and production logs a warning. Hosted databases always use TLS unless the URL has `sslmode=disable` (or `DATABASE_SSL=false`), e.g. for a plain Postgres on a private network. |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase project URL and service-role key, for storing images uploaded in `/admin`. **Server only** — never prefix these with `VITE_`. |
| `SUPABASE_STORAGE_BUCKET` | Optional. Public Storage bucket for uploads (default `site-images`; `npm run db:migrate` creates it). |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin login credentials. Required in production (with `ADMIN_PASSWORD_HASH` standing in for `ADMIN_PASSWORD`): admin login stays disabled if the username or both password variables are missing, or the password is the `changeme` placeholder. Dev falls back to `admin` / `changeme`. |
| `ADMIN_PASSWORD_HASH` | Preferred over `ADMIN_PASSWORD`: an scrypt hash, so the host never stores the raw password. Generate it with `npm run hash-password` (type the password when prompted, or pipe it on stdin) and paste the printed value. Takes precedence when both are set; a malformed hash disables admin login in production. |
| `SESSION_SECRET` | Session signing secret. Required in production: a missing or placeholder value disables admin login. |
| `CORS_ORIGIN` | Optional comma-separated origins allowed to call the API during local development. |

## Project structure

```
src/
  pages/          Route components (Index, Blog, BlogDetails,
                  ServiceDetails, ProjectDetails, Contact, BlogStudio)
  components/     Hero, Services, Projects, Contact, Navbar, Footer, …
    ui/           shadcn/ui primitives
  content/blog/   Markdown blog posts (one .md file per post)
  data/           services.ts, projects.ts — structured content
  config/site.ts  Single source of truth for brand/contact data
  lib/            blog.ts, groq.ts, analytics.ts, utils.ts
api/
  index.js        Vercel Express function for /api
  [...path].js    Vercel catch-all for /api/*
server/src/
  app.js          Express app used by Vercel and local start
  routes/         Public and admin API routes
  models/         Data access per table (posts, projects, team, content)
  db.js           PostgreSQL pool and query helpers
  migrate.js      Applies server/db/migrations/*.sql
  storage.js      Supabase Storage uploads
server/db/
  migrations/     SQL migrations, applied in name order
scripts/
  seo-plugin.ts   Build-time sitemap.xml + rss.xml generation
  site-routes.ts  The public route list shared by the sitemap and prerender
  prerender-plugin.ts  Build-time prerender of every public page (see below)
```

### Editing content

- **Brand, contact, and SEO defaults** live in `src/config/site.ts` — change
  them in one place rather than hardcoding anywhere. Set
  `siteConfig.contact.bookingUrl` to a Cal.com or Calendly link to make
  "Book a call" (footer and `/contact`) open it in a new tab; left empty,
  the footer link dials the main phone number.
- **Services** and **projects** are data-driven from `src/data/`.
- **Blog posts** are Markdown files in `src/content/blog/`. The build's SEO
  plugin reads these (plus services and projects) to regenerate
  `sitemap.xml` and `rss.xml` automatically, so the feeds never drift.

### AI Blog Studio (`/studio`)

A developer-only authoring tool that drafts blog posts with the Groq API. The
route and key are only mounted during `npm run dev` and never reach a
production bundle. Workflow: run the dev server, draft a post, download the
generated `.md`, commit it, then deploy the static content — never the key.

## API and admin

The browser always calls relative `/api/...` URLs. In development, Vite proxies
those calls to the local Express process. In production, Vercel routes `/api`
and `/api/*` to the root `api/` functions in this same project, so the admin
session cookie is first-party on `www.nesisoft.com`.

The admin panel lives at `/admin` and supports CRUD for posts, projects, team
members, uploaded images, and editable homepage content.

- **Login rate limit:** after 5 failed sign-ins from one IP within 15 minutes,
  further attempts get `429` until the window passes; 50 failures across all
  IPs locks sign-in for everyone (the owner included) for the same window.
  Counters are in memory, so each serverless instance keeps its own.
- **Uploads** accept only JPEG, PNG, WebP, AVIF and GIF, checked by the file's
  bytes; anything else (including SVG) gets `415`.

## Database (Supabase)

The API stores blog posts, projects, team members, the editable homepage copy
and admin sessions in PostgreSQL, and images uploaded in `/admin` in Supabase
Storage. The public pages don't depend on it: without a database they render
the content bundled in `src/`.

1. Create a project at [supabase.com](https://supabase.com).
2. **Database:** click **Connect** in the dashboard and copy a connection
   string into `DATABASE_URL`, with your database password filled in. Use the
   **Transaction pooler** URI (port 6543) on Vercel; locally either pooler
   works.
3. **Storage:** from **Project Settings → API**, copy the project URL into
   `SUPABASE_URL` and the `service_role` (secret) key into
   `SUPABASE_SERVICE_ROLE_KEY`. Keep that key server-side only.
4. Run `npm run seed`. It applies the migrations, creates the public
   `site-images` bucket, and imports the bundled posts, projects and homepage
   copy (skipping anything already there). Later schema changes only need
   `npm run db:migrate`.

Every table has row level security enabled with no policies, so Supabase's
public REST API can't read or change them; the server connects as the table
owner, which isn't subject to RLS.

## Deployment

Deploy the repository root as one **Vercel** project. Set the server-only
environment variables in Vercel project settings, then build with
`npm run build`. `vercel.json` sends non-asset frontend routes that weren't
prerendered to `200.html` while Vercel handles `/api/...` with the Express
functions in `api/`.

### Prerendering

`npm run build` also renders every public page (home, blog and posts,
services, projects, contact, privacy, team) to static HTML with React's server
renderer (`scripts/prerender-plugin.ts`, `src/entry-server.tsx`), so search
engines, AI crawlers and link previews that don't run JavaScript get each
page's real content and its own title, description, canonical, Open Graph tags
and JSON-LD. The browser then hydrates that markup. The route list lives in
`scripts/site-routes.ts` and also feeds the sitemap.

Each page is written as both `dist/<path>/index.html` and `dist/<path>.html`,
plus `dist/404.html` and `dist/200.html` — the plain client-only shell for
everything that isn't prerendered (`/admin`, unknown URLs). On a static host,
point the SPA fallback at the shell: on Render, the rewrite rule should be
`/*` → `/200.html` (Render serves real files before applying rules). If the
fallback still points at `/index.html`, pages keep working: a prerendered page
served for another URL hides itself and the app renders the right one.
