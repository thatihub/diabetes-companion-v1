import 'dotenv/config';
import axios from 'axios';
import fs from 'fs';
import { query } from './src/db.js';

const TOKEN_FILE = './dexcom_tokens.json';

async function testLiveSync() {
    if (!fs.existsSync(TOKEN_FILE)) {
        console.error("❌ No tokens found. Please connect Dexcom first.");
        return;
    }

    const { access_token } = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
    const DEX_BASE_URL = process.env.DEXCOM_BASE_URL || 'https://api.dexcom.com';

    try {
        console.log("📡 Fetching Data Range...");
        const rangeRes = await axios.get(`${DEX_BASE_URL}/v2/users/self/dataRange`, {
            headers: { Authorization: `Bearer ${access_token}` }
        });
        console.log("📥 Range Data:", JSON.stringify(rangeRes.data, null, 2));

        // Let's try to fetch the last 24 hours from NOW, regardless of range data
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const fmt = (d) => d.toISOString().split('.')[0];
        const startDate = fmt(yesterday);
        const endDate = fmt(now);

        console.log(`📡 Fetching EGVs between ${startDate} and ${endDate}...`);
        const egvUrl = `${DEX_BASE_URL}/v2/users/self/egvs?startDate=${startDate}&endDate=${endDate}`;

        const egvRes = await axios.get(egvUrl, {
            headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/json' }
        });

        const egvs = egvRes.data.egvs || [];
        console.log(`✅ Success! Found ${egvs.length} records.`);

        if (egvs.length > 0) {
            console.log("🕒 Latest record:", egvs[0].displayTime, "Value:", egvs[0].value);

            // Try to insert one into DB as a test
            const r = egvs[0];
            await query(
                `INSERT INTO glucose_readings (glucose_mgdl, measured_at, source, notes)
                 VALUES ($1, $2, 'dexcom_api', 'Dexcom API (Terminal Test)')
                 ON CONFLICT DO NOTHING`,
                [r.value, r.systemTime.endsWith("Z") ? r.systemTime : r.systemTime + "Z"]
            );
            console.log("💾 Test record saved to database.");
        } else {
            console.log("❓ No records found for the last 24 hours.");
            console.log("Full response body:", JSON.stringify(egvRes.data, null, 2));
        }

    } catch (err) {
        if (err.response) {
            console.error("❌ API Error:", err.response.status, err.response.data);
        } else {
            console.error("❌ Error:", err.message);
        }
    } finally {
        process.exit();
    }
}

testLiveSync();
