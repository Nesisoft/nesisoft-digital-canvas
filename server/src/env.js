import dotenv from "dotenv";

/**
 * VERCEL_ENV as the platform set it, read before any .env file is loaded, so
 * a production env pulled into .env.local can't make a local run pass for a
 * production deploy (see deploy.js).
 */
export const platformVercelEnv = process.env.VERCEL_ENV;

// Same precedence as Vite: .env.local overrides .env (dotenv never replaces a
// value that's already set, so the first file to set a variable wins).
dotenv.config({ path: ".env.local" });
dotenv.config();
dotenv.config({ path: "server/.env" });
