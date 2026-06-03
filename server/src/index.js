import "dotenv/config";
import { createApp } from "./app.js";
import { connectDB } from "./db.js";

// Local / long-running entrypoint. On Vercel the app is exported from
// `api/index.js` instead and this file is never run.
const PORT = process.env.PORT || 5000;
const app = createApp();

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`[server] listening on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("[db] connection failed:", err.message);
    process.exit(1);
  });
