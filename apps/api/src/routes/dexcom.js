import { Router } from "express";
import axios from "axios";
import fs from "fs";
import path from "path";
import { query } from "../db.js";

export const dexcomRouter = Router();

const DEX_BASE_URL = process.env.DEXCOM_BASE_URL || "https://api.dexcom.com";
const TOKEN_FILE = path.resolve("dexcom_tokens.json");

// STRUCTURED LOGGER
function logDexcom(step, data) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        step,
        env: DEX_BASE_URL.includes("sandbox") ? "SANDBOX" : "PRODUCTION",
        ...data
    };
    console.log(`[DEXCOM] ${JSON.stringify(logEntry)}`);
}

/**
 * 1. GET /api/dexcom/login
 */
dexcomRouter.get("/login", (req, res) => {
    const clientId = process.env.DEXCOM_CLIENT_ID;
    const redirectUri = process.env.DEXCOM_REDIRECT_URI;

    if (!clientId || !redirectUri) {
        return res.status(500).send("Missing DEXCOM_CLIENT_ID or DEXCOM_REDIRECT_URI in env");
    }

    const scope = "offline_access";
    const loginUrl = `${DEX_BASE_URL}/v2/oauth2/login?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;

    logDexcom("CONNECT_REDIRECT_CREATED", { url: loginUrl, redirect_uri: redirectUri });
    res.redirect(loginUrl);
});

/**
 * 2. GET /api/dexcom/callback
 */
dexcomRouter.get("/callback", async (req, res) => {
    const { code, error } = req.query;

    if (error) {
        logDexcom("CALLBACK_ERROR", { error });
        return res.redirect(`http://localhost:3001?dexcom_error=${encodeURIComponent(error)}`);
    }
    if (!code) return res.status(400).send("No code returned");

    logDexcom("CALLBACK_CODE_RECEIVED", { code: "****" });

    try {
        // Exchange Code
        const tokenParams = new URLSearchParams({
            client_id: process.env.DEXCOM_CLIENT_ID,
            client_secret: process.env.DEXCOM_CLIENT_SECRET,
            code: code,
            grant_type: "authorization_code",
            redirect_uri: process.env.DEXCOM_REDIRECT_URI
        });

        logDexcom("TOKEN_EXCHANGE_REQUEST", { url: `${DEX_BASE_URL}/v2/oauth2/token`, params: tokenParams.toString() });

        const tokenRes = await axios.post(`${DEX_BASE_URL}/v2/oauth2/token`, tokenParams.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        logDexcom("TOKEN_EXCHANGE_RESPONSE", { status: tokenRes.status, body: tokenRes.data });

        const { access_token, refresh_token, expires_in } = tokenRes.data;

        // PERSIST TOKENS (Minimal Fix)
        const tokenData = {
            access_token,
            refresh_token,
            expires_at: Date.now() + (expires_in * 1000),
            updated_at: new Date().toISOString()
        };
        fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenData, null, 2));

        // SYNC DATA (Background - Non-blocking to prevent OAuth TTO timeouts)
        // We trigger the sync but DON'T await it before redirecting.
        logDexcom("SYNC_STARTED_BACKGROUND", { message: "Redirecting user now while sync continues." });
        syncData(access_token).then(stats => {
            logDexcom("SYNC_COMPLETED_BACKGROUND", stats);
        }).catch(err => {
            logDexcom("SYNC_FAILED_BACKGROUND", { error: err.message });
        });

        // Redirect immediately back to the frontend
        // We use a fallback but ideally should come from an env var
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
        res.redirect(`${frontendUrl}?dexcom_sync=started`);

    } catch (err) {
        const errDetails = err.response ? { status: err.response.status, data: err.response.data } : { message: err.message };
        logDexcom("AUTH_FAILURE", errDetails);
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
        res.redirect(`${frontendUrl}?dexcom_error=AUTH_FAILED`);
    }
});

/**
 * Sync Logic
 */
async function syncData(accessToken) {
    let stats = { validRange: false, count: 0, latest: null };
    let startDate, endDate;

    try {
        // 1. Data Range
        logDexcom("RANGE_REQUEST", { url: `${DEX_BASE_URL}/v2/users/self/dataRange` });
        const rangeRes = await axios.get(`${DEX_BASE_URL}/v2/users/self/dataRange`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        logDexcom("RANGE_RESPONSE", { status: rangeRes.status, data: rangeRes.data });

        const rangeData = rangeRes.data;

        if (DEX_BASE_URL.includes("sandbox")) {
            // STRATEGY: Sandbox "Genesis" (Start of Data)
            // The "End" of data is returning 0 records.
            // We will check the "Start" of data (2020) to see if ANY data exists.

            console.log(`[Dexcom Sync] Strategy: Sandbox Genesis (2020)`);

            let anchorTimeStr = "2020-01-01T00:00:00";
            if (rangeData && rangeData.egvs && rangeData.egvs.start) {
                anchorTimeStr = rangeData.egvs.start.systemTime;
            }

            const cleanStart = anchorTimeStr.replace("Z", "");
            const startRef = new Date(cleanStart + "Z"); // Parse as UTC

            const endRef = new Date(startRef.getTime() + 48 * 60 * 60 * 1000); // +48h

            const fmt = (d) => d.toISOString().split('.')[0];
            const startDate = fmt(startRef);
            const endDate = fmt(endRef);

            const egvUrl = `${DEX_BASE_URL}/v2/users/self/egvs?startDate=${startDate}&endDate=${endDate}`;
            const eventsUrl = `${DEX_BASE_URL}/v2/users/self/events?startDate=${startDate}&endDate=${endDate}`;

            logDexcom("EGV_FETCH_REQUEST", { url: egvUrl });

            const [egvRes, eventsRes] = await Promise.all([
                axios.get(egvUrl, { headers: { Authorization: `Bearer ${accessToken}` } }),
                axios.get(eventsUrl, { headers: { Authorization: `Bearer ${accessToken}` } })
            ]);

            logDexcom("EGV_FETCH_RESPONSE", { status: egvRes.status, count: egvRes.data.egvs ? egvRes.data.egvs.length : 0 });

            const egvs = egvRes.data.egvs || [];
            const events = eventsRes.data.events || [];
            stats.count = egvs.length;
            if (egvs.length > 0) stats.latest = egvs[0].displayTime;

            // Insert (Shared logic)
            for (const r of egvs) {
                if (r.value) {
                    await query(
                        `INSERT INTO glucose_readings (glucose_mgdl, measured_at, source, notes)
                        VALUES ($1, $2, 'dexcom_api', 'Dexcom API (Sandbox 2020)')
                        ON CONFLICT DO NOTHING`,
                        [r.value, r.systemTime.endsWith("Z") ? r.systemTime : r.systemTime + "Z"]
                    );
                }
            }
            // Insert Events 
            for (const e of events) {
                let carbs = e.value && e.unit === 'grams' ? e.value : null;
                let insulin = e.value && e.unit === 'units' ? e.value : null;
                if (carbs || insulin) {
                    await query(
                        `INSERT INTO glucose_readings (glucose_mgdl, measured_at, source, carbs_grams, insulin_units, notes)
                        VALUES (NULL, $1, 'dexcom_api', $2, $3, $4)
                        ON CONFLICT DO NOTHING`,
                        [e.systemTime.endsWith("Z") ? e.systemTime : e.systemTime + "Z", carbs, insulin, `Dexcom Event: ${e.eventType}`]
                    );
                }
            }

            return stats;
        }

        // PRODUCTION LOGIC (Sync up to 90 days of history in chunks)
        if (rangeData && rangeData.egvs && rangeData.egvs.end) {
            stats.validRange = true;

            const anchorTimeStr = rangeData.egvs.end.systemTime;
            console.log(`[Dexcom Sync] Deep Sync Initiated. Anchor: ${anchorTimeStr}`);

            const anchorRef = new Date(anchorTimeStr.replace("Z", "") + "Z");

            // Loop to pull 90 days in 30-day chunks (API limit)
            for (let i = 0; i < 3; i++) {
                const chunkEnd = i === 0
                    ? new Date(anchorRef.getTime() + 1 * 60 * 60 * 1000)
                    : new Date(anchorRef.getTime() - (i * 30 * 24 * 60 * 60 * 1000));

                const chunkStart = new Date(anchorRef.getTime() - ((i + 1) * 30 * 24 * 60 * 60 * 1000));

                const fmt = (d) => d.toISOString().split('.')[0];
                const s = fmt(chunkStart);
                const e = fmt(chunkEnd);

                console.log(`[Dexcom Sync] Pulling Chunk ${i + 1}/3: ${s} to ${e}`);

                const version = DEX_BASE_URL.includes("sandbox") ? "v2" : "v3";
                const egvUrl = `${DEX_BASE_URL}/${version}/users/self/egvs?startDate=${s}&endDate=${e}`;
                const eventsUrl = `${DEX_BASE_URL}/${version}/users/self/events?startDate=${s}&endDate=${e}`;

                try {
                    const [egvRes, eventsRes] = await Promise.all([
                        axios.get(egvUrl, { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } }),
                        axios.get(eventsUrl, { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } })
                    ]);

                    const chunkEgvs = version === "v3" ? (egvRes.data.records || []) : (egvRes.data.egvs || []);
                    const chunkEvents = version === "v3" ? (eventsRes.data.records || []) : (eventsRes.data.events || []);

                    console.log(`[Dexcom Sync] Chunk ${i + 1} found ${chunkEgvs.length} EGVs and ${chunkEvents.length} events.`);

                    // 1. Batch Insert EGVs
                    if (chunkEgvs.length > 0) {
                        if (i === 0) stats.latest = chunkEgvs[0].displayTime;
                        stats.count += chunkEgvs.length;

                        const batchSize = 500;
                        for (let j = 0; j < chunkEgvs.length; j += batchSize) {
                            const batch = chunkEgvs.slice(j, j + batchSize);
                            const values = [];
                            const params = [];

                            batch.forEach((r, idx) => {
                                if (r.value) {
                                    const base = params.length;
                                    params.push(r.value, r.systemTime.endsWith("Z") ? r.systemTime : r.systemTime + "Z");
                                    values.push(`($${base + 1}, $${base + 2}, 'dexcom_api', 'Dexcom API (Live Data)')`);
                                }
                            });

                            if (values.length > 0) {
                                await query(
                                    `INSERT INTO glucose_readings (glucose_mgdl, measured_at, source, notes)
                                     VALUES ${values.join(', ')} 
                                     ON CONFLICT DO NOTHING`,
                                    params
                                );
                            }
                        }
                    }

                    // 2. Batch Insert Events (Carbs/Insulin)
                    if (chunkEvents.length > 0) {
                        // Aggregate events by timestamp to prevent batch-internal conflicts
                        const eventMap = new Map();

                        chunkEvents.forEach(ev => {
                            const type = ev.recordType || ev.eventType; // V3 vs V2
                            if (type !== 'carbs' && type !== 'insulin') return;

                            const time = ev.systemTime.endsWith("Z") ? ev.systemTime : ev.systemTime + "Z";

                            if (!eventMap.has(time)) {
                                eventMap.set(time, {
                                    time,
                                    carbs: 0,
                                    insulin: 0,
                                    notes: []
                                });
                            }

                            const entry = eventMap.get(time);
                            const val = Number(ev.value);

                            if (type === 'carbs') {
                                entry.carbs += val;
                                entry.notes.push(`Carbs: ${val}g`);
                            } else if (type === 'insulin') {
                                entry.insulin += val;
                                entry.notes.push(`Insulin: ${val}u`);
                            }
                        });

                        const uniqueEvents = Array.from(eventMap.values());
                        console.log(`[Dexcom Sync] Processing ${uniqueEvents.length} aggregated event timestamps.`);

                        const batchSize = 500;
                        for (let j = 0; j < uniqueEvents.length; j += batchSize) {
                            const batch = uniqueEvents.slice(j, j + batchSize);
                            const values = [];
                            const params = [];

                            batch.forEach((ev) => {
                                const base = params.length;
                                // Params: time, note, carbs, insulin
                                params.push(
                                    ev.time,
                                    `Dexcom Event: ${ev.notes.join(', ')}`,
                                    ev.carbs > 0 ? ev.carbs : null,
                                    ev.insulin > 0 ? ev.insulin : null
                                );
                                // Values: (glucose, measured_at, source, notes, carbs, insulin)
                                values.push(`(NULL, $${base + 1}, 'dexcom_api', $${base + 2}, $${base + 3}, $${base + 4})`);
                            });

                            if (values.length > 0) {
                                await query(
                                    `INSERT INTO glucose_readings (glucose_mgdl, measured_at, source, notes, carbs_grams, insulin_units)
                                     VALUES ${values.join(', ')} 
                                     ON CONFLICT (measured_at) DO UPDATE SET
                                        carbs_grams = COALESCE(EXCLUDED.carbs_grams, glucose_readings.carbs_grams),
                                        insulin_units = COALESCE(EXCLUDED.insulin_units, glucose_readings.insulin_units),
                                        notes = glucose_readings.notes || '; ' || EXCLUDED.notes`,
                                    params
                                );
                            }
                        }
                    }
                } catch (chunkErr) {
                    console.error(`[Dexcom Sync] Chunk ${i + 1} failed:`, chunkErr.response?.data || chunkErr.message);
                }
            }
        } else {
            console.log("[Dexcom Sync] No range data found. Skipping deep sync.");
        }

        return stats;

    } catch (err) {
        const errDetails = err.response ? { status: err.response.status, data: err.response.data } : { message: err.message };
        logDexcom("SYNC_FAILURE", errDetails);
        return stats;
    }
}
