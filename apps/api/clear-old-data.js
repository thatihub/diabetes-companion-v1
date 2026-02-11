
import 'dotenv/config';
import { query } from "./src/db.js";

async function clearDexcomData() {
    try {
        console.log("Cleaning up old Sandbox/Dexcom data...");
        // Deletes all readings sourced from Dexcom API (Sandbox or Prod)
        const res = await query("DELETE FROM glucose_readings WHERE source = 'dexcom_api'");
        console.log(`Deleted ${res.rowCount} records.`);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
clearDexcomData();
