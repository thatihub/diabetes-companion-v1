import { Router } from "express";
import axios from "axios";
import { query } from "../db.js";

export const dexcomRouter = Router();

// CONFIG: Using Production API for Individual Access
// ⚠️ WARNING: Do not switch to Sandbox without understanding the connection limits.
const DEX_BASE_URL = process.env.DEXCOM_BASE_URL || "https://api.dexcom.com";
// const DEX_BASE_URL = "https://sandbox-api.dexcom.com"; 

/**
 * 1. GET /api/dexcom/login
 * Redirects user to Dexcom Login Page
 */
dexcomRouter.get("/login", (req, res) => {
    const clientId = process.env.DEXCOM_CLIENT_ID;
    const redirectUri = process.env.DEXCOM_REDIRECT_URI;

    if (!clientId | !redirectUri) {
        return res.status(500).send("Missing DEXCOM_CLIENT_ID or DEXCOM_REDIRECT_URI in env");
    }

    const scope = "offline_access"; // Needed for refresh tokens
    const loginUrl = `${DEX_BASE_URL}/v2/oauth2/login?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;

    res.redirect(loginUrl);
});

/**
 * 2. GET /api/dexcom/callback
 * Handle return from Dexcom with 'code'
 */
dexcomRouter.get("/callback", async (req, res) => {
    const { code, error } = req.query;

    if (error) return res.status(400).send(`Dexcom Error: ${error}`);
    if (!code) return res.status(400).send("No code returned");

    try {
        // Exchange Code for Token
        const tokenRes = await axios.post(`${DEX_BASE_URL}/v2/oauth2/token`, new URLSearchParams({
            client_id: process.env.DEXCOM_CLIENT_ID,
            client_secret: process.env.DEXCOM_CLIENT_SECRET,
            code: code,
            grant_type: "authorization_code",
            redirect_uri: process.env.DEXCOM_REDIRECT_URI
        }).toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, refresh_token, expires_in } = tokenRes.data;

        // FETCH DATA IMMEDIATELY (Simulating sync)
        // In reality, you'd save tokens to DB and sync in background.
        // For V2 Demo: Fetch last 24h

        await syncData(access_token);

        // Redirect to Web Dashboard
        res.redirect("http://localhost:3001?dexcom_sync=success");

    } catch (err) {
        console.error("/// DEXCOM AUTH FAILED ///");
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", JSON.stringify(err.response.data, null, 2));
            console.error("Headers:", JSON.stringify(err.response.headers, null, 2));
        } else {
            console.error("Error:", err.message);
        }
        res.status(500).send("Authentication Failed. Check server console for details.");
    }
});

// Helper to fetch and sync data
async function syncData(accessToken) {
    const now = new Date();
    // Fetch last 30 days (Standard for Production)
    const pastDate = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Ensure strictly UTC format YYYY-MM-DDTHH:MM:SS
    const startDate = pastDate.toISOString().replace(/\.\d+Z$/, "");
    const endDate = now.toISOString().replace(/\.\d+Z$/, "");

    console.log(`[Dexcom Sync] Fetching range: ${startDate} to ${endDate} (UTC)`);
    // console.log(`[Dexcom Sync] Using Token: ${accessToken.substring(0, 10)}...`);

    try {
        // Fetch Glucose (EGVs) AND Events (Carbs/Insulin) in parallel
        const [egvRes, eventRes] = await Promise.all([
            axios.get(`${DEX_BASE_URL}/v2/users/self/egvs`, {
                params: { startDate, endDate },
                headers: { Authorization: `Bearer ${accessToken}` }
            }),
            axios.get(`${DEX_BASE_URL}/v2/users/self/events`, {
                params: { startDate, endDate },
                headers: { Authorization: `Bearer ${accessToken}` }
            })
        ]);

        const egvs = egvRes.data.egvs || [];
        const events = eventRes.data.events || [];

        console.log(`Fetched ${egvs.length} readings and ${events.length} events from Dexcom`);

        // 1. Insert Glucose Readings
        for (const r of egvs) {
            if (r.value) {
                await query(
                    `INSERT INTO glucose_readings (glucose_mgdl, measured_at, source, notes)
                     VALUES ($1, $2, 'dexcom_api', 'Dexcom API')
                     ON CONFLICT DO NOTHING`,
                    [r.value, r.systemTime]
                );
            }
        }

        // 2. Insert Events (Carbs / Insulin)
        for (const e of events) {
            // Dexcom events: 'carbs', 'insulin', 'exercise', 'health'
            // We are interested in carbs (grams) and insulin (units)
            let carbs = e.value && e.unit === 'grams' ? e.value : null;
            let insulin = e.value && e.unit === 'units' ? e.value : null;

            // Only insert if it's relevant
            if (carbs || insulin) {
                await query(
                    `INSERT INTO glucose_readings (glucose_mgdl, measured_at, source, carbs_grams, insulin_units, notes)
                     VALUES (NULL, $1, 'dexcom_api', $2, $3, $4)
                     ON CONFLICT DO NOTHING`,
                    [e.systemTime, carbs, insulin, `Dexcom Event: ${e.eventType}`]
                );
            }
        }

    } catch (error) {
        console.error("/// DEXCOM SYNC ERROR ///");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error:", error.message);
        }
    }
}
