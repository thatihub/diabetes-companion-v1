import 'dotenv/config';
import axios from 'axios';
import fs from 'fs';
import { query } from './src/db.js';

const TOKEN_FILE = './dexcom_tokens.json';

async function finalSync() {
    const { access_token } = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
    const DEX_BASE_URL = 'https://api.dexcom.com';

    try {
        // Fetch 24 hours of REAL data using v3
        const now = new Date();
        const start = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('.')[0];
        const end = now.toISOString().split('.')[0];

        console.log(`📡 Fetching REAL v3 data from ${start}...`);
        const res = await axios.get(`${DEX_BASE_URL}/v3/users/self/egvs?startDate=${start}&endDate=${end}`, {
            headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/json' }
        });

        const records = res.data.records || [];
        console.log(`✅ Found ${records.length} real records.`);

        for (const r of records) {
            await query(
                `INSERT INTO glucose_readings (glucose_mgdl, measured_at, source, notes)
                 VALUES ($1, $2, 'dexcom_api', 'Dexcom API (v3 Live)')
                 ON CONFLICT DO NOTHING`,
                [r.value, r.systemTime]
            );
        }
        console.log("🚀 Real data synced to database!");
    } catch (e) {
        console.error("❌ Sync failed:", e.response?.data || e.message);
    } finally {
        process.exit();
    }
}

finalSync();
