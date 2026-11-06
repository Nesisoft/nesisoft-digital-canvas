import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import cors from "cors";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { INVALID_INPUT_CODES, databaseConfigured, getPool, isConnectionError } from "./db.js";
import { isProd, SESSION_SECRET } from "./auth.js";
import publicRoutes from "./routes/public.js";
import adminRoutes from "./routes/admin.js";
import inquiryRoutes from "./routes/inquiries.js";
import waitlistRoutes from "./routes/waitlist.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../../dist");

// Baseline security headers on every response, API and static alike. No CSP
// yet: it would break the SPA's inline boot loader and third-party fonts.
function securityHeaders(_req, res, next) {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
  });
  // Production only: dev runs on plain-HTTP localhost.
  if (isProd) {
    res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
}

function isSameOrigin(origin, host) {
  try {
    return Boolean(host) && new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * The built file for a page: dist/index.html for "/", otherwise the
 * prerendered dist/<path>.html or dist/<path>/index.html, and the client-only
 * shell (200.html) for anything that wasn't prerendered (/admin, unknown URLs).
 */
function pageFile(urlPath) {
  let clean;
  try {
    clean = decodeURIComponent(urlPath).replace(/\/+$/, "");
  } catch {
    return path.join(distDir, "200.html"); // malformed %-escape
  }
  const candidates = clean ? [`${clean}.html`, `${clean}/index.html`] : ["index.html"];
  for (const candidate of candidates) {
    const file = path.join(distDir, candidate);
    // path.join resolves "..", so this keeps every lookup inside dist/.
    if (file.startsWith(distDir + path.sep) && fs.existsSync(file)) return file;
  }
  return path.join(distDir, "200.html");
}

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  // Behind Vercel's proxy — required for secure cookies to be set over HTTPS.
  app.set("trust proxy", 1);
  app.use(securityHeaders);

  // The public API is consumed cross-origin by the Vite app; the admin UI is
  // same-origin so its session cookie rides along without CORS concerns.
  const allowedOrigins = (
    process.env.CORS_ORIGIN || "http://localhost:8080,http://localhost:5173"
  )
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  // Browsers send Origin on same-origin POSTs too (the /admin login on
  // www.nesisoft.com), so a request from the API's own host is always
  // allowed; CORS_ORIGIN only lists the extra, cross-origin dev servers.
  app.use(
    cors((req, cb) => {
      const origin = req.get("Origin");
      if (!origin || allowedOrigins.includes(origin) || isSameOrigin(origin, req.get("Host"))) {
        return cb(null, { origin: true, credentials: true });
      }
      const err = new Error(`Origin ${origin} not allowed by CORS`);
      err.status = 403;
      cb(err);
    }),
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  const sessionOptions = {
    name: "nesisoft.sid",
    // Never a publicly known value in production (see auth.js).
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // The admin UI and API are served from one origin in the monolith, so a
      // first-party lax cookie is enough for the dashboard session.
      sameSite: "lax",
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
  };

  if (databaseConfigured) {
    // Sessions live in Postgres (the "session" table from the migrations), so
    // admin logins survive restarts and serverless instances. Without a
    // usable database there's no data to administer anyway; MemoryStore will
    // do, and the data routes answer 503.
    try {
      const PgStore = connectPgSimple(session);
      sessionOptions.store = new PgStore({
        pool: getPool(),
        tableName: "session",
        // Serverless instances are short-lived; skip the background pruning
        // timer there (the login route prunes expired rows instead).
        pruneSessionInterval: process.env.VERCEL ? false : 15 * 60,
        errorLog: (...args) => console.error("[session]", ...args),
      });
    } catch (err) {
      console.error("[session]", err.message);
    }
  }

  app.use(session(sessionOptions));

  // "/" belongs to the site (npm start serves the homepage there), so the
  // status check lives here only.
  app.get("/health", (_req, res) => res.json({ ok: true }));

  // Pure JSON API. The admin UI is a route in the public site
  // (www.nesisoft.com/admin) and talks to these endpoints.
  app.use("/api/inquiries", inquiryRoutes);
  app.use("/api/waitlist", waitlistRoutes);
  app.use("/api", publicRoutes);
  app.use("/api/admin", adminRoutes);

  // `npm start` serves the built site too (on Vercel the CDN does). Assets and
  // other real files come straight from dist/; no directory index or
  // trailing-slash redirect, so /blog stays /blog and gets its prerendered
  // page below, matching the canonical URLs.
  if (isProd && !process.env.VERCEL) {
    app.use(express.static(distDir, { index: false, redirect: false }));
    app.get("*", (req, res) => {
      res.sendFile(pageFile(req.path));
    });
  }

  // Unknown API paths answer in JSON like the rest of the API.
  app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

  // JSON error handler (keeps CORS/multer errors from leaking HTML stacks).
  app.use((err, _req, res, next) => {
    // Too late to send an error body; let Express close the connection.
    if (res.headersSent) return next(err);

    let status = err.status || err.statusCode;
    let message = err.message;
    if (err.code === "LIMIT_FILE_SIZE") {
      status = 413;
      message = "Image is too large (4 MB max)";
    } else if (err instanceof multer.MulterError || /^(Multipart|Unexpected end of form)/.test(message)) {
      status = 400; // malformed upload: wrong field, extra file, truncated body
    } else if (!status && INVALID_INPUT_CODES.includes(err.code)) {
      status = 400; // Postgres rejected the input (bad number/date, NUL byte…)
      message = "Invalid input";
    } else if (!status && isConnectionError(err)) {
      status = 503; // e.g. the session store can't reach the database
    }
    status ||= 500;
    console.error("[error]", err.message);
    // 4xx messages tell the client what to fix. 5xx ones can carry internals
    // (database hosts, SQL), so production sends a generic line instead,
    // unless the error carries one that's safe to show, and the details stay
    // in the log.
    if (status >= 500 && isProd) {
      message =
        err.publicMessage ||
        (status === 503 ? "Service temporarily unavailable" : "Server error");
    }
    res.status(status).json({ error: message || "Server error" });
  });

  return app;
}
