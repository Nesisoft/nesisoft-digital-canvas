import dotenv from "dotenv";

// Same precedence as Vite: .env.local overrides .env (dotenv never replaces a
// value that's already set, so the first file to set a variable wins).
dotenv.config({ path: ".env.local" });
dotenv.config();
dotenv.config({ path: "server/.env" });
