
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not found");
  
  const sql = neon(url);
  const db = drizzle(sql);
  
  const users = await sql`SELECT * FROM users`;
  console.log("Users in DB:", JSON.stringify(users, null, 2));
}

main().catch(console.error);
