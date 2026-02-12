import 'dotenv/config';
import { query } from "./src/db.js";

async function checkRecentData() {
    try {
        const result = await query(
            "SELECT notes, count(*), MIN(measured_at) as earliest_reading, MAX(measured_at) as latest_reading FROM glucose_readings GROUP BY notes ORDER BY latest_reading DESC;"
        );
        console.table(result.rows);
    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        process.exit();
    }
}

checkRecentData();
