import 'dotenv/config';
import axios from 'axios';
import fs from 'fs';
import { query } from './src/db.js';

const TOKEN_FILE = './dexcom_tokens.json';

async function deepSync90Days() {
    if (!fs.existsSync(TOKEN_FILE)) {
        console.error("❌ No tokens found.");
        return;
    }

    const { access_token } = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
    const DEX_BASE_URL = 'https://api.dexcom.com';

    try {
        console.log("📡 Fetching Data Range to find anchor...");
        const rangeRes = await axios.get(`${DEX_BASE_URL}/v2/users/self/dataRange`, {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const anchorTimeStr = rangeRes.data.egvs.end.systemTime;
        const anchorRef = new Date(anchorTimeStr.replace("Z", "") + "Z");

        console.log(`🚀 Deep Sync Started. Anchor: ${anchorTimeStr}`);

        let totalInserted = 0;

        // API limit is 30 days per request. We loop 3 times to get 90 days.
        for (let i = 0; i < 3; i++) {
            const chunkEnd = i === 0
                ? new Date(anchorRef.getTime() + 1 * 60 * 60 * 1000)
                : new Date(anchorRef.getTime() - (i * 30 * 24 * 60 * 60 * 1000));

            const chunkStart = new Date(anchorRef.getTime() - ((i + 1) * 30 * 24 * 60 * 60 * 1000));

            const fmt = (d) => d.toISOString().split('.')[0];
            const s = fmt(chunkStart);
            const e = fmt(chunkEnd);

            console.log(`📦 Chunk ${i + 1}/3: ${s} to ${e}`);

            const [egvRes, eventsRes] = await Promise.all([
                axios.get(`${DEX_BASE_URL}/v3/users/self/egvs?startDate=${s}&endDate=${e}`, {
                    headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/json' }
                }),
                axios.get(`${DEX_BASE_URL}/v3/users/self/events?startDate=${s}&endDate=${e}`, {
                    headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/json' }
                })
            ]);

            const egvs = egvRes.data.records || [];
            const events = eventsRes.data.records || [];
            console.log(`✅ Chunk ${i + 1}: Found ${egvs.length} EGVs and ${events.length} events.`);

            // Insert EGVs
            for (const r of egvs) {
                if (r.value) {
                    await query(
                        `INSERT INTO glucose_readings (glucose_mgdl, measured_at, source, notes)
                         VALUES ($1, $2, 'dexcom_api', 'Dexcom API (v3 Live)')
                         ON CONFLICT DO NOTHING`,
                        [r.value, r.systemTime]
                    );
                    totalInserted++;
                }
            }

            // Insert Events
            for (const ev of events) {
                if (ev.eventType === 'carbs' || ev.eventType === 'insulin') {
                    const carbs = ev.eventType === 'carbs' ? ev.value : null;
                    const insulin = ev.eventType === 'insulin' ? ev.value : null;
                    const note = `Dexcom Event: ${ev.eventType}${ev.eventSubType ? ' (' + ev.eventSubType + ')' : ''}`;

                    await query(
                        `INSERT INTO glucose_readings (glucose_mgdl, measured_at, source, notes, carbs_grams, insulin_units)
                         VALUES (NULL, $1, 'dexcom_api', $2, $3, $4)
                         ON CONFLICT DO NOTHING`,
                        [ev.systemTime, note, carbs, insulin]
                    );
                    totalInserted++;
                }
            }
        }
        console.log(`🏁 90-Day Sync Complete! Total records processed: ${totalInserted}`);
    } catch (e) {
        console.error("❌ Deep Sync failed:", e.response?.data || e.message);
    } finally {
        process.exit();
    }
}

deepSync90Days();
