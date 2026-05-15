import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazy initialization to avoid build-time errors
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    if (process.env.DATABASE_URL.includes("...")) {
      return null;
    }
    try {
      const sql = neon(process.env.DATABASE_URL);
      _db = drizzle(sql, { schema });
    } catch (e) {
      console.error("Failed to initialize database:", e);
      return null;
    }
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    const actualDb = getDb();
    if (!actualDb) {
      throw new Error("Database not configured. Please add a valid DATABASE_URL to your .env.local file.");
    }
    return (actualDb as unknown as Record<string | symbol, unknown>)[prop];
  }
});

export * from "./schema";