
const { neon } = require("@neondatabase/serverless");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env.local") });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not found");
  
  const sql = neon(url);
  const userId = "user_3DigeEZiP0fJA1DKNCItLcL4YSk";
  
  try {
    const result = await sql`
      UPDATE users 
      SET plan = 'pro', subscription_status = 'active', updated_at = NOW() 
      WHERE id = ${userId}
      RETURNING *
    `;
    console.log("UPDATE_RESULT:" + JSON.stringify(result));
  } catch (e) {
    console.error("Error updating user:", e);
  }
}

main().catch(console.error);
