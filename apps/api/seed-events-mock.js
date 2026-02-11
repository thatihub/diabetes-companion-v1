import 'dotenv/config';
import { query, pool } from './src/db.js';

async function seedEvents() {
    console.log("🌱 STARTING MOCK EVENTS SEED (Insulin & Carbs)...");

    if (!process.env.DATABASE_URL) {
        console.error("❌ Error: DATABASE_URL not found in environment.");
        process.exit(1);
    }

    const DAYS = 90;
    const now = new Date();
    // Helper to format as Postgres timestamp
    const fmt = (d) => d.toISOString();

    console.log(`📅 Generating typical meal/insulin patterns for the last ${DAYS} days...`);

    let events = [];

    for (let d = 0; d < DAYS; d++) {
        const dayStart = new Date(now);
        dayStart.setDate(dayStart.getDate() - d);
        dayStart.setHours(0, 0, 0, 0);

        // --- Breakfast (7-9 AM) ---
        const bTime = new Date(dayStart);
        bTime.setHours(7 + Math.random() * 2, Math.floor(Math.random() * 60));
        events.push({
            time: bTime,
            glucose: Math.floor(90 + Math.random() * 30), // 90-120
            carbs: Math.floor(30 + Math.random() * 20),
            insulin: parseFloat((3 + Math.random() * 2).toFixed(1)),
            meal: 'Breakfast'
        });

        // --- Lunch (12-2 PM) ---
        const lTime = new Date(dayStart);
        lTime.setHours(12 + Math.random() * 2, Math.floor(Math.random() * 60));
        events.push({
            time: lTime,
            glucose: Math.floor(100 + Math.random() * 40), // 100-140
            carbs: Math.floor(50 + Math.random() * 30),
            insulin: parseFloat((5 + Math.random() * 3).toFixed(1)),
            meal: 'Lunch'
        });

        // --- Dinner (6-8 PM) ---
        const dTime = new Date(dayStart);
        dTime.setHours(18, 30 + Math.random() * 120);
        events.push({
            time: dTime,
            glucose: Math.floor(110 + Math.random() * 50), // 110-160
            carbs: Math.floor(60 + Math.random() * 30),
            insulin: parseFloat((6 + Math.random() * 4).toFixed(1)),
            meal: 'Dinner'
        });
    }

    console.log(`📝 Generated ${events.length} event records. Inserting...`);

    let inserted = 0;
    try {
        // Using a transaction for speed (though not strictly necessary)
        await query('BEGIN');

        for (const e of events) {
            await query(
                `INSERT INTO glucose_readings (glucose_mgdl, measured_at, source, carbs_grams, insulin_units, notes)
                 VALUES ($1, $2, 'mock_events', $3, $4, $5)
                 ON CONFLICT (measured_at) DO NOTHING`,
                [e.glucose, fmt(e.time), e.carbs, e.insulin, `Mock ${e.meal}`]
            );
            inserted++;
            if (inserted % 50 === 0) process.stdout.write('.');
        }

        await query('COMMIT');
        console.log(`\n✅ Success! Inserted ${inserted} mock event records.`);
    } catch (err) {
        await query('ROLLBACK');
        console.error("\n❌ Insert failed:", err);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

seedEvents();
