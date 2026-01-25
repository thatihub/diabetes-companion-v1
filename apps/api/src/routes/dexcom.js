import { Router } from "express";
import axios from "axios";
import { query } from "../db.js";

export const dexcomRouter = Router();

// CONFIG (Move to .env later, but using Sandbox hardcoded URL for clarity)
const DEX_BASE_URL = "https://sandbox-api.dexcom.com";
// const DEX_BASE_URL = "https://api.dexcom.com"; // Future Production

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
        console.error("Dexcom auth failed:", err.response?.data || err.message);
        res.status(500).send("Authentication Failed. Check console.");
    }
});

// Helper to fetch and sync data
async function syncData(accessToken) {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

    // Dexcom format: YYYY-MM-DDTHH:MM:SS
    const startDate = twentyFourHoursAgo.toISOString().split('.')[0];
    const endDate = now.toISOString().split('.')[0];

    try {
        const response = await axios.get(`${DEX_BASE_URL}/v2/users/self/egvs`, {
            params: {
                startDate: startDate,
                endDate: endDate
            },
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const egvs = response.data.egvs || [];
        console.log(`Fetched ${egvs.length} readings from Dexcom`);

        // Insert into DB
        for (const r of egvs) {
            // Dexcom 'value' is mg/dL. 'systemTime' is ISO.
            if (r.value) {
                await query(
                    `INSERT INTO glucose_readings (glucose_mgdl, measured_at, source, notes)
                     VALUES ($1, $2, 'dexcom_api', 'Sandbox Data')
                     ON CONFLICT DO NOTHING`, // Prevent dupes if simple unique constraint exists, else might duplicate
                    [r.value, r.systemTime]
                );
            }
        }
    } catch (error) {
        console.error("Data fetch failed:", error.response?.data || error.message);
    }
}
