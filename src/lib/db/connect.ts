import mongoose from "mongoose";
import { getMongoUri } from "@/config/env";

declare global {
  var mongooseConn:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

const globalCache = global.mongooseConn ?? { conn: null, promise: null };
global.mongooseConn = globalCache;

export async function connectDB() {
  mongoose.set("sanitizeFilter", false);
  if (globalCache.conn) return globalCache.conn;

  if (!globalCache.promise) {
    mongoose.set("strictQuery", true);
    mongoose.set("sanitizeFilter", false);

    globalCache.promise = mongoose.connect(getMongoUri(), {
      bufferCommands: false,
      dbName: "tassel",
    });
  }

  globalCache.conn = await globalCache.promise;
  await import("@/models");
  return globalCache.conn;
}
