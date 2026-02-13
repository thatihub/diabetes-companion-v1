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
  const start = Date.now();
  console.log(`[DB] Executing query: ${text.substring(0, 50)}...`);
  try {
    const res = await pool.query(text, params);
    console.log(`[DB] Query returned in ${Date.now() - start}ms`);
    return res;
  } catch (err) {
    console.error(`[DB] Query failed after ${Date.now() - start}ms:`, err.message);
    throw err;
  }
}
