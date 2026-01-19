import pg from "pg";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ Missing DATABASE_URL environment variable.");
  process.exit(1);
}

// Force rejectUnauthorized to false before creating the pool
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Quick helper for queries
export async function query(text, params) {
  return pool.query(text, params);
}
