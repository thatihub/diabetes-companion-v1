import 'dotenv/config';
import axios from 'axios';
import fs from 'fs';

const TOKEN_FILE = './dexcom_tokens.json';

async function diagnoseFormatting() {
    const { access_token } = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
    const DEX_BASE_URL = process.env.DEXCOM_BASE_URL || 'https://api.dexcom.com';

    // Target the known point from dataRange: 2026-02-12T07:41:11
    const testCases = [
        "2026-02-12T00:00:00", // Start of today (UTC)
        "2026-02-12T07:41:11", // Exactly the anchor
        "2026-02-11T20:00:00"  // Shifted 12 hours
    ];

    for (const start of testCases) {
        const end = "2026-02-12T23:59:59";
        console.log(`\n🧪 Testing window: ${start} to ${end}`);
        try {
            const res = await axios.get(`${DEX_BASE_URL}/v2/users/self/egvs?startDate=${start}&endDate=${end}`, {
                headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/json' }
            });
            console.log(`📊 Response: ${res.data.egvs?.length || 0} records.`);
            if (res.data.egvs && res.data.egvs.length > 0) {
                console.log("💎 FIRST RECORD:", JSON.stringify(res.data.egvs[0], null, 2));
                break;
            }
        } catch (e) {
            console.log(`❌ Error for ${start}:`, e.response?.status || e.message);
        }
    }
    process.exit();
}

diagnoseFormatting();
