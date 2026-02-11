import 'dotenv/config';
import { query } from "./src/db.js";

async function clearDatabase() {
    console.log("⚠️  WARNING: This will DELETE ALL DATA from 'glucose_readings'.");
    console.log("Starting in 3 seconds... (Press Ctrl+C to cancel)");

    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
        console.log("🗑️  Truncating table...");
        await query("TRUNCATE TABLE glucose_readings RESTART IDENTITY;");
        console.log("✅ Database cleared. 'glucose_readings' is now empty.");
    } catch (err) {
        console.error("❌ Failed to clear database:", err);
    } finally {
        process.exit();
    }
}

clearDatabase();
