
import pg from "pg";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Helper to load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, ".env"), override: true });

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSLMODE === "only" || process.env.PGSSLMODE === "require"
        ? { rejectUnauthorized: false }
        : false,
});

async function seed() {
    console.log("Seeding 90 days of Mock Data...");
    const client = await pool.connect();

    try {
        // Clear existing mock data first to avoid duplicates/mess
        await client.query("DELETE FROM glucose_readings WHERE notes = 'Mock History'");

        const now = new Date();
        const records = [];
        const days = 90;

        // Loop backwards from now
        for (let d = 0; d < days; d++) {
            // For each day, 288 readings (every 5 mins)
            for (let i = 0; i < 288; i++) {
                const msBack = (d * 24 * 60 * 60 * 1000) + (i * 5 * 60 * 1000); // go back d days + i intervals
                const time = new Date(now.getTime() - msBack);

                // Simulate realistic curve
                // Base Sine Wave for circadian rhythm (high in morning/night)
                const hour = time.getHours();
                const minute = time.getMinutes();
                const totalMin = hour * 60 + minute;

                // Base: 110
                let value = 110;

                // Add noise
                value += (Math.random() - 0.5) * 10;

                // Add Meal Spikes (approximate)
                // Breakfast (8am - 10am)
                if (hour >= 8 && hour < 10) value += 30 + Math.sin(minute) * 10;
                // Lunch (12pm - 2pm)
                if (hour >= 12 && hour < 14) value += 40 + Math.sin(minute) * 10;
                // Dinner (6pm - 9pm)
                if (hour >= 18 && hour < 21) value += 50 + Math.sin(minute) * 15;

                // Night time low (2am - 5am)
                if (hour >= 2 && hour < 5) value -= 10;

                // Clamp
                value = Math.max(50, Math.min(300, Math.floor(value)));

                records.push({
                    glucose_mgdl: value,
                    measured_at: time.toISOString(),
                    source: "mock_seed",
                    notes: "Mock History"
                });
            }
            if (d % 10 === 0) console.log(`Generated day ${d}...`);
        }

        console.log(`Inserting ${records.length} records. This might take a moment...`);

        // Batch insert to avoid 26k individual queries
        // Postgres limit params is ~65000. 
        // Each row has 4 params. So max rows per batch = 16000.
        // We have 26000. Do it in chunks of 5000.

        const chunkSize = 5000;
        for (let i = 0; i < records.length; i += chunkSize) {
            const chunk = records.slice(i, i + chunkSize);

            // Build huge query
            // INSERT INTO table (cols) VALUES ($1,$2,$3,$4), ($5,$6,$7,$8)...
            const values = [];
            const placeholders = [];
            let pIdx = 1;

            for (const r of chunk) {
                placeholders.push(`($${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++})`);
                values.push(r.glucose_mgdl, r.measured_at, r.source, r.notes);
            }

            const queryText = `
                INSERT INTO glucose_readings (glucose_mgdl, measured_at, source, notes)
                VALUES ${placeholders.join(", ")}
                ON CONFLICT DO NOTHING
            `;

            await client.query(queryText, values);
            console.log(`Inserted batch ${i} - ${i + chunk.length}`);
        }

        console.log("✅ 90 Days Mock Data Inserted Successfully!");

    } catch (err) {
        console.error("Seed Failed:", err);
    } finally {
        client.release();
        pool.end();
    }
}

seed();
