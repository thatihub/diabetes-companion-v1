
import pg from "pg";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, ".env"), override: true });

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSLMODE === "only" || process.env.PGSSLMODE === "require"
        ? { rejectUnauthorized: false }
        : false,
});

async function fix() {
    console.log("🛠 Checking for Duplicates and Fixing Schema...");
    const client = await pool.connect();

    try {
        // 1. Check for duplicates based on measured_at
        const dupes = await client.query(`
            SELECT measured_at, COUNT(*) 
            FROM glucose_readings 
            GROUP BY measured_at 
            HAVING COUNT(*) > 1
        `);

        if (dupes.rowCount > 0) {
            console.log(`⚠️ Found ${dupes.rowCount} timestamps with duplicate entries. Cleaning up...`);

            // Delete duplicates, keeping the one with max ID (latest insert)
            // CTE to identify IDs to delete
            await client.query(`
                DELETE FROM glucose_readings a USING (
                    SELECT MIN(id) as id, measured_at
                    FROM glucose_readings 
                    GROUP BY measured_at HAVING COUNT(*) > 1
                ) b
                WHERE a.measured_at = b.measured_at 
                AND a.id <> b.id
            `);
            console.log("✅ Duplicates removed.");
        } else {
            console.log("✅ No duplicates found.");
        }

        // 2. Add Unique Constraint if missing
        try {
            await client.query(`
                ALTER TABLE glucose_readings 
                ADD CONSTRAINT unique_measured_at UNIQUE (measured_at)
            `);
            console.log("✅ Added Unique Constraint on 'measured_at'.");
        } catch (err) {
            if (err.code === '42710') { // duplicate_object (constraint exists)
                console.log("ℹ️ Unique Constraint already exists.");
            } else {
                throw err;
            }
        }

    } catch (err) {
        console.error("Fix Failed:", err);
    } finally {
        client.release();
        pool.end();
    }
}

fix();
