# Server Source

This directory contains the Express + MongoDB API source used by the monolith.
It is not a separate npm project or Vercel deployment.

Run everything from the repository root:

```bash
npm install
npm run dev
npm run seed
npm run build
npm start
```

In production, Vercel serves the React app and the API from the same project:

- `https://www.nesisoft.com/` -> React frontend
- `https://www.nesisoft.com/admin` -> React admin page
- `https://www.nesisoft.com/api/...` -> Express API from `api/index.js`

Server-only environment variables are documented in the root `.env.example`.
