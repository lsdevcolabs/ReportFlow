
const { neon } = require("@neondatabase/serverless");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env.local") });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not found");
  
  const sql = neon(url);
  
  try {
    const users = await sql`SELECT * FROM users`;
    console.log("USERS_LIST:" + JSON.stringify(users));
  } catch (e) {
    console.error("Error querying users:", e);
  }
}

main().catch(console.error);
