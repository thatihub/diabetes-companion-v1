import 'dotenv/config';
import { query as db } from "./src/db.js";

async function generateMockData() {
    console.log("Generating mock data...");

    const mealTypes = ["fasting", "pre_meal", "post_meal", "bedtime"];

    // Generate data for the last 14 days
    for (let i = 0; i < 14; i++) {
        const day = new Date();
        day.setDate(day.getDate() - i);

        // Generate 4-6 readings per day
        const readingsCount = 4 + Math.floor(Math.random() * 3);

        for (let j = 0; j < readingsCount; j++) {
            // Random time between 6 AM and 11 PM
            const hour = 6 + Math.floor(Math.random() * 17);
            const minute = Math.floor(Math.random() * 60);
            const measuredAt = new Date(day);
            measuredAt.setHours(hour, minute, 0, 0);

            // Realistic glucose values (70 - 250)
            const glucose = 70 + Math.floor(Math.random() * 180);

            // Random carbs (0 - 100g) mainly for pre/post meals
            const isMeal = Math.random() > 0.4;
            const carbs = isMeal ? 20 + Math.floor(Math.random() * 80) : 0;

            // Random insulin (0 - 10u)
            const insulin = isMeal ? (carbs / 10 + Math.random() * 2).toFixed(1) : 0;

            // Tag
            const tag = mealTypes[Math.floor(Math.random() * mealTypes.length)];

            await db(
                `INSERT INTO glucose_readings (glucose_mgdl, measured_at, meal_tag, carbs_grams, insulin_units)
                 VALUES ($1, $2, $3, $4, $5)`,
                [glucose, measuredAt.toISOString(), tag, carbs, insulin]
            );
        }
    }

    console.log("Mock data generation complete!");
    process.exit(0);
}

generateMockData();
