import 'dotenv/config';
import { query } from "./src/db.js";

async function setupDexcomSchema() {
    console.log("🛠️ Starting Database Setup for Dexcom Integration...");

    try {
        // 1. Add 'source' column if it doesn't exist
        console.log("--> Checking for 'source' column...");
        await query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                               WHERE table_name='glucose_readings' AND column_name='source') THEN 
                    ALTER TABLE glucose_readings ADD COLUMN source VARCHAR(50) DEFAULT 'manual';
                    RAISE NOTICE 'Added source column';
                END IF; 
            END $$;
        `);

        // 2. Add 'external_id' column for tracking unique Dexcom IDs (stops duplicates)
        console.log("--> Checking for 'external_id' column...");
        await query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                               WHERE table_name='glucose_readings' AND column_name='external_id') THEN 
                    ALTER TABLE glucose_readings ADD COLUMN external_id VARCHAR(255);
                    RAISE NOTICE 'Added external_id column';
                END IF; 
            END $$;
        `);

        // 3. Create a unique constraint to prevent duplicates
        // We'll trust the 'external_id' from Dexcom, or fall back to time+source uniqueness
        console.log("--> Adding unique constraint for Dexcom data...");
        // Note: We use a partial unique index so we don't break existing manual entries that might have same timestamps
        await query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_dexcom_unique_readings 
            ON glucose_readings (measured_at, source) 
            WHERE source = 'dexcom_api';
        `);

        console.log("✅ Database schema updated successfully!");

    } catch (err) {
        console.error("❌ Setup Failed:", err);
    } finally {
        process.exit();
    }
}

setupDexcomSchema();
