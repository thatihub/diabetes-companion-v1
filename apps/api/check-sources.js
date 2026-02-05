
import 'dotenv/config';
import { query } from "./src/db.js";

async function checkSources() {
    try {
        const res = await query("SELECT DISTINCT source, COUNT(*) FROM glucose_readings GROUP BY source");
        console.log("Sources found:", res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
checkSources();
