import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nesisoft";

// Cache the connection across invocations. On Vercel each serverless function
// may be re-used between requests; without this we'd open a new connection
// (and exhaust the pool) on every cold-ish call.
let cached = global.__mongoose;
if (!cached) cached = global.__mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => {
      console.log("[db] connected");
      return m.connection;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export { MONGODB_URI };
