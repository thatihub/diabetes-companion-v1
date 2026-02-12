import 'dotenv/config';
import { query } from "./src/db.js";

async function clearMockData() {
    console.log("🧹 Cleaning up 'Dexcom API (Mock)' and 'Dexcom API (Mock Fallback)' entries...");

    try {
        const result = await query(
            "DELETE FROM glucose_readings WHERE notes LIKE '%Mock%';"
        );
        console.log(`✅ Success! Removed ${result.rowCount} mock entries.`);
    } catch (err) {
        console.error("❌ Failed to clear mock data:", err);
    } finally {
        process.exit();
    }
}

clearMockData();
