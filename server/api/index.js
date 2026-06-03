import "dotenv/config";
import { createApp } from "../src/app.js";

// Vercel serverless entrypoint. An Express app is a valid (req, res) handler,
// so exporting it directly lets Vercel route every request through Express.
// No app.listen() here — the platform manages the lifecycle.
const app = createApp();

export default app;
