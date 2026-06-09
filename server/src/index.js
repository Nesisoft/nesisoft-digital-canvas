import "./env.js";
import { createApp } from "./app.js";

// Local / long-running entrypoint. On Vercel the app is exported from
// `api/index.js` instead and this file is never run.
const PORT = process.env.PORT || 5000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
