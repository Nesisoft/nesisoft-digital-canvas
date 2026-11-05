# Server Source

This directory contains the Express + PostgreSQL API source used by the monolith.
It is not a separate npm project or Vercel deployment.

Run everything from the repository root:

```bash
npm install
npm run dev
npm run db:migrate
npm run seed
npm run admin:password -- you@example.com   # if locked out of /admin
npm run build
npm start
```

In production, Vercel serves the React app and the API from the same project:

- `https://www.nesisoft.com/` -> React frontend
- `https://www.nesisoft.com/admin` -> React admin page
- `https://www.nesisoft.com/api/...` -> Express API from `api/index.js`

The schema lives in `server/db/migrations/` (plain SQL, applied in name order
by `npm run db:migrate`, and automatically on every Vercel production deploy
by `npm run db:deploy`). Server-only environment variables are documented in
the root `.env.example`.
