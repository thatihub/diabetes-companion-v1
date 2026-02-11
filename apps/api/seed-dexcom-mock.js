import 'dotenv/config';
import { query as db } from "./src/db.js";

async function generateDexcomMockData() {
    console.log("Generating Dexcom-like mock data (High Frequency)...");

    // Clear existing Dexcom mock data to avoid overlap
    await db(`DELETE FROM glucose_readings WHERE source = 'dexcom_api'`);

    const daysToGenerate = 90; // Generate last 90 days for full history testing
    const now = new Date();

    // Start from X days ago
    let currentTime = new Date();
    currentTime.setDate(currentTime.getDate() - daysToGenerate);

    // Initial glucose level
    let currentGlucose = 110;

    // Trend simulation
    let trend = 0;

    let readingsCount = 0;

    while (currentTime <= now) {
        // 1. Update Glucose with a "Random Walk" + "Daily Cycle" logic
        // Daily cycle: Glucose often rises after meals (approx 8am, 1pm, 7pm)
        const hour = currentTime.getHours();
        let mealFactor = 0;

        // Simulating meal spikes roughly
        if ((hour === 8 || hour === 13 || hour === 19) && currentTime.getMinutes() < 30) {
            mealFactor = 2; // Upward pressure
        } else if ((hour === 10 || hour === 15 || hour === 21)) {
            mealFactor = -1.5; // Downward pressure (insulin kicking in)
        }

        // Random oscillation
        const change = (Math.random() - 0.5) * 4 + mealFactor + trend;
        currentGlucose += change;

        // Dampening/Correction (Keep between 60 and 350)
        // If too high, trend down. If too low, trend up.
        if (currentGlucose > 200) trend = -0.5;
        else if (currentGlucose > 160) trend = -0.2;
        else if (currentGlucose < 70) trend = 0.5;
        else if (currentGlucose < 90) trend = 0.2;
        else trend = (Math.random() - 0.5) * 0.1; // Drift

        // Clamp values
        currentGlucose = Math.max(40, Math.min(400, currentGlucose));

        // 2. Insert Record (Every 15 mins to save DB rows, but typically Dexcom is 5 mins)
        // Let's do every 15 mins for performance, which is enough for charts.

        await db(
            `INSERT INTO glucose_readings (glucose_mgdl, measured_at, source, notes)
             VALUES ($1, $2, 'dexcom_api', 'Simulated G7')`,
            [Math.round(currentGlucose), currentTime.toISOString()]
        );

        readingsCount++;

        // Advance 15 minutes
        currentTime.setMinutes(currentTime.getMinutes() + 15);
    }

    console.log(`✅ Success! Inserted ${readingsCount} mock Dexcom readings.`);
    process.exit(0);
}

generateDexcomMockData();
