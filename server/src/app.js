import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";

import { connectDB, MONGODB_URI } from "./db.js";
import publicRoutes from "./routes/public.js";
import adminRoutes from "./routes/admin.js";

const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  // Behind Vercel's proxy — required for secure cookies to be set over HTTPS.
  app.set("trust proxy", 1);

  // The public API is consumed cross-origin by the Vite app; the admin UI is
  // same-origin so its session cookie rides along without CORS concerns.
  const allowedOrigins = (
    process.env.CORS_ORIGIN || "http://localhost:8080,http://localhost:5173"
  )
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      name: "nesisoft.sid",
      secret: process.env.SESSION_SECRET || "dev-insecure-session-secret",
      resave: false,
      saveUninitialized: false,
      // Persist sessions in MongoDB so logins survive across serverless
      // invocations (a plain MemoryStore would not).
      store: MongoStore.create({ mongoUrl: MONGODB_URI }),
      cookie: {
        httpOnly: true,
        // The admin UI lives on the public site (nesisoft.com/admin). When the
        // API is reached cross-site, "none" + Secure is required for the cookie
        // to be sent; first-party (proxied /api) works the same. Dev stays lax.
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
        maxAge: 1000 * 60 * 60 * 8, // 8 hours
      },
    }),
  );

  // Ensure a live DB connection before handling any data route (serverless
  // functions start cold). Cached, so this is a no-op once connected.
  app.use(async (_req, _res, next) => {
    try {
      await connectDB();
      next();
    } catch (err) {
      next(err);
    }
  });

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.get("/", (_req, res) => res.json({ ok: true, status: "green" }));

  // Pure JSON API. The admin UI is a route in the public site
  // (nesisoft.com/admin) and talks to these endpoints.
  app.use("/api", publicRoutes);
  app.use("/api/admin", adminRoutes);

  // JSON error handler (keeps CORS/multer errors from leaking HTML stacks).
  app.use((err, _req, res, _next) => {
    console.error("[error]", err.message);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  });

  return app;
}
