# Nesisoft Server

Express + MongoDB **API** for managing the site's **blog posts** and **team**.
Content and uploaded images are served live from this API; the public Vite app
fetches them at runtime. The admin UI itself is a route in the frontend app at
**`nesisoft.com/admin`** (see `src/pages/Admin.tsx`) — this server is pure API.

## Stack

- **Express** — JSON API (no UI)
- **MongoDB / Mongoose** — posts, team members, and image bytes
- **express-session** + **connect-mongo** — session auth, stored in MongoDB
- **multer** — image uploads (stored as binary in MongoDB)

## Setup

```bash
cd server
npm install
cp .env.example .env   # then fill in MONGODB_URI (the .env is gitignored)
npm run seed           # imports existing markdown posts + placeholder team
npm run dev            # or: npm start
```

Server runs at `http://localhost:5000`.

## Environment (`server/.env`)

| Var | Purpose |
| --- | --- |
| `PORT` | Server port (default `5000`) |
| `CORS_ORIGIN` | Comma-separated origins allowed to call the public API |
| `MONGODB_URI` | MongoDB connection string |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin login (hardcoded fallbacks in `src/auth.js`) |
| `SESSION_SECRET` | Session signing secret |

> Auth is intentionally simple for now — credentials live in env with hardcoded
> fallbacks. Move to a real user store before production.

## Admin panel

The admin UI is **part of the frontend** at `/admin` (e.g.
`http://localhost:8080/admin` in dev, `https://nesisoft.com/admin` in prod).
Sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD`. From there you can:

- Create / edit / delete blog posts (Markdown body, cover image, draft toggle)
- Create / edit / delete team members (photo, role, bio, socials, order)
- Upload images — stored in MongoDB and referenced as `/api/images/:id`

The page authenticates against this server's `/api/admin/*` endpoints.

## API

**Public (read-only):**

| Method | Path | Returns |
| --- | --- | --- |
| `GET` | `/api/posts` | Published posts (newest first) |
| `GET` | `/api/posts/:slug` | A single published post |
| `GET` | `/api/team` | Published team members (by `order`) |
| `GET` | `/api/content` | Editable site copy (hero + about) |
| `GET` | `/api/images/:id` | Image binary |
| `GET` | `/health` | `{ ok: true }` |

**Admin (session-protected, under `/api/admin`):** `login`, `logout`, `me`,
`images` (upload), `content` (`GET`/`PUT`), and full CRUD for `posts` and `team`.

### Editable content

The **Site content** tab in the admin edits a single document (hero headline +
subtitle, about eyebrow/title/description, mission, "why work with us" list, and
the stats grid). The homepage Hero/About read it via `/api/content`; saving
updates the live site without a deploy. `DEFAULT_CONTENT` (mirrored on the
client) keeps the site looking identical until something is edited.

## How the frontend connects

The Vite app (including `/admin`) calls `/api/...` via `src/lib/api.ts` and
`src/lib/adminApi.ts`. To keep the admin session cookie **first-party**, `/api`
is served from the *same origin* as the site:

- **Dev:** Vite proxies `/api` → `http://localhost:5000` (`vite.config.ts`).
- **Prod:** the frontend's `vercel.json` rewrites `/api/*` → this server. So
  `VITE_API_URL` stays **empty** and the browser only ever talks to
  `nesisoft.com`.

## Deploying to Vercel

This server deploys as **its own Vercel project**, separate from the public
site. The app is exported as a serverless function from `api/index.js`;
`vercel.json` routes every request through Express.

1. **New Vercel project** → import this repo → set **Root Directory = `server`**.
2. Add **Environment Variables** (Project → Settings → Environment Variables —
   do *not* rely on the gitignored `.env`):
   - `MONGODB_URI`
   - `CORS_ORIGIN` → `https://nesisoft.com,https://www.nesisoft.com`
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`
3. **MongoDB Atlas → Network Access**: allow `0.0.0.0/0` (Vercel's function IPs
   are dynamic), or Vercel's published ranges.
4. Deploy and note the server's domain (e.g. `nesisoft-server.vercel.app`).
5. After the first deploy, run the seed once against the same database
   (locally: `npm run seed`).

Notes for serverless:
- Sessions are stored in MongoDB (`connect-mongo`), so logins persist across
  function invocations. In production the cookie is `Secure` + `SameSite=None`
  with `trust proxy` enabled.
- The Mongo connection is cached globally to avoid exhausting the pool on
  warm invocations.

### Point the site at this server

In the **frontend** repo, edit `vercel.json` and replace `YOUR_SERVER_DOMAIN`
with the deployed server domain from step 4:

```json
{ "source": "/api/:path*", "destination": "https://nesisoft-server.vercel.app/api/:path*" }
```

Redeploy the frontend. The admin panel is then live at
**`https://nesisoft.com/admin`**, calling the API first-party through the proxy.
