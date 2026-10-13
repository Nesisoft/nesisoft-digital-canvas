import "./env.js";
import { createApp } from "./app.js";

// Local / long-running entrypoint. On Vercel the app is exported from
// `api/index.js` instead and this file is never run.
// 5050, not 5000: macOS AirPlay Receiver occupies :5000.
const PORT = process.env.PORT || 5050;
const app = createApp();

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
