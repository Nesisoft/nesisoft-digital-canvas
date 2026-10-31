import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { connectDB, MONGODB_URI } from "./db.js";
import { isProd, SESSION_SECRET } from "./auth.js";
import publicRoutes from "./routes/public.js";
import adminRoutes from "./routes/admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../../dist");

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

  if (isProd) {
    // Persist sessions in MongoDB so logins survive across serverless
    // invocations. Local dev uses MemoryStore to avoid a second Mongo client
    // crashing the API when Atlas is unavailable.
    const store = MongoStore.create({ mongoUrl: MONGODB_URI });
    store.on("error", (err) => {
      console.error("[session]", err.message);
    });
    sessionOptions.store = store;
  }

  app.use(session(sessionOptions));

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.get("/", (_req, res) => res.json({ ok: true, status: "green" }));

  // Ensure a live DB connection before handling any data route (serverless
  // functions start cold). Cached, so this is a no-op once connected.
  app.use(async (_req, _res, next) => {
    try {
      await connectDB();
      next();
    } catch (err) {
      err.status = 503;
      next(err);
    }
  });

  // Pure JSON API. The admin UI is a route in the public site
  // (www.nesisoft.com/admin) and talks to these endpoints.
  app.use("/api", publicRoutes);
  app.use("/api/admin", adminRoutes);

  if (isProd && !process.env.VERCEL) {
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  // JSON error handler (keeps CORS/multer errors from leaking HTML stacks).
  app.use((err, _req, res, _next) => {
    console.error("[error]", err.message);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  });

  return app;
}
