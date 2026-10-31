# Nesisoft — Digital Solutions for Africa

The marketing and content website for **Nesisoft**, a full-cycle software
development company building custom web, mobile, desktop, and IoT applications,
along with internal platforms like Agoo, Sua, Adesuapa, and Jua.

A monolith application with a React frontend and an Express + MongoDB API served
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
- **Express** + **MongoDB / Mongoose** for live blog, project, team, image, and
  editable site content APIs
- **express-session** + **connect-mongo** for admin sessions

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
npm run seed        # Seed MongoDB content
npm run lint        # ESLint
npm run hash-password  # Prompt for the admin password, print ADMIN_PASSWORD_HASH
```

## Configuration

Copy `.env.example` to `.env.local` and fill in the values you need. All
client-exposed variables must be prefixed with `VITE_`.

| Variable | Purpose |
| --- | --- |
| `VITE_WEB3FORMS_ACCESS_KEY` | Contact-form and blog newsletter-signup delivery via [Web3Forms](https://web3forms.com); both arrive in the inbox tied to the key. Without it, the contact form falls back to opening the visitor's mail client and the newsletter signup is hidden. |
| `VITE_PLAUSIBLE_DOMAIN` | Privacy-friendly [Plausible](https://plausible.io) analytics. Leave blank to disable analytics. |
| `VITE_GROQ_API_KEY` | **Dev only.** Powers the AI Blog Studio at `/studio`. Must **not** be set for production builds — `VITE_` vars are embedded in the client bundle. |
| `MONGODB_URI` | MongoDB connection string for the API. |
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
  models/         Mongoose models
scripts/
  seo-plugin.ts   Build-time sitemap.xml + rss.xml generation
```

### Editing content

- **Brand, contact, and SEO defaults** live in `src/config/site.ts` — change
  them in one place rather than hardcoding anywhere.
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

## Deployment

Deploy the repository root as one **Vercel** project. Set the server-only
environment variables in Vercel project settings, then build with
`npm run build`. `vercel.json` sends non-asset frontend routes to `index.html`
while Vercel handles `/api/...` with the Express functions in `api/`.
