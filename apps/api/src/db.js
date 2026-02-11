import pg from "pg";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ Missing DATABASE_URL environment variable.");
  process.exit(1);
}

// Force rejectUnauthorized to false before creating the pool
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

console.log("DEBUG: Initializing DB Pool with URL:", DATABASE_URL ? (DATABASE_URL.substring(0, 15) + "...") : "MISSING");

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000, // Increase to 10s for slower cold starts
  idleTimeoutMillis: 30000,
  max: 10
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Quick helper for queries
export async function query(text, params) {
  console.log(`[DB] Executing query: ${text.substring(0, 50)}...`);
  return pool.query(text, params);
}
