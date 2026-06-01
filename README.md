# Nesisoft — Digital Solutions for Africa

The marketing and content website for **Nesisoft**, a full-cycle software
development company building custom web, mobile, desktop, and IoT applications,
along with internal platforms like Agoo, Sua, Adesuapa, and Jua.

A single-page React application with code-split routes for services, projects,
a Markdown-driven blog, and a contact page — plus a developer-only AI Blog
Studio for drafting posts.

## Tech stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** with **shadcn/ui** (Radix primitives)
- **React Router** for client-side routing
- **TanStack Query** for data/state
- **react-hook-form** + **zod** for forms and validation
- **react-markdown** + **remark-gfm** for blog rendering

## Getting started

The only requirement is Node.js & npm (or [bun](https://bun.sh)).

```sh
# Install dependencies
npm install

# Start the dev server (http://localhost:8080)
npm run dev
```

Other scripts:

```sh
npm run build       # Production build → dist/
npm run build:dev   # Development-mode build
npm run preview     # Preview the production build locally
npm run lint        # ESLint
```

## Configuration

Copy `.env.example` to `.env.local` and fill in the values you need. All
client-exposed variables must be prefixed with `VITE_`.

| Variable | Purpose |
| --- | --- |
| `VITE_WEB3FORMS_ACCESS_KEY` | Contact-form delivery via [Web3Forms](https://web3forms.com). Without it, the form falls back to opening the visitor's mail client. |
| `VITE_PLAUSIBLE_DOMAIN` | Privacy-friendly [Plausible](https://plausible.io) analytics. Leave blank to disable analytics. |
| `VITE_GROQ_API_KEY` | **Dev only.** Powers the AI Blog Studio at `/studio`. Must **not** be set for production builds — `VITE_` vars are embedded in the client bundle. |

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

## Deployment

The site is a static SPA deployed on **Vercel** (see `vercel.json`, which
rewrites all non-asset routes to `index.html` and sets long-lived caching for
hashed assets). Build with `npm run build` and serve `dist/`.
