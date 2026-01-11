import pg from "pg";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ Missing DATABASE_URL environment variable.");
  process.exit(1);
}

// For Supabase + Render: always use SSL in production.
// pg uses ssl: { rejectUnauthorized: false } for managed Postgres commonly.
const isProd = process.env.NODE_ENV === "production";

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: isProd ? { rejectUnauthorized: false } : false
});

// Quick helper for queries
export async function query(text, params) {
  return pool.query(text, params);
}
