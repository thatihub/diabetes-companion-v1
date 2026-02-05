import { Router } from "express";
import axios from "axios";
import { query } from "../db.js";

export const insightsRouter = Router();

// Retrieve Key
const rawKey = process.env.OPENAI_API_KEY || "";
const OPENAI_API_KEY = rawKey.replace(/^"|"$/g, '').trim();

/**
 * POST /api/insights/analyze
 * Body: { range: "48h" | "7d" | "14d" | "90d" }
 */
insightsRouter.post("/analyze", async (req, res) => {
    const range = req.body.range || "48h";
    console.log(`[AI] Analysis requested for range: ${range}`);

    try {
        let promptData = "";
        let sysPrompt = "";

        if (range === "48h" || range === "24h") {
            // DETAILED MODE (Raw Logs)
            const result = await query(
                `select * from glucose_readings 
                 where measured_at > now() - interval '48 hours'
                 order by measured_at desc limit 150`
            );
            const readings = result.rows;
            if (readings.length < 3) return res.json({ analysis: "Insufficient data." });

            promptData = readings.map(r =>
                `- ${new Date(r.measured_at).toLocaleString()}: ${r.glucose_mgdl} mg/dL`
            ).join("\n");

            sysPrompt = `Analyze these raw glucose logs (last 48h). Identify immediate patterns (spikes, drops). Format as bullet points.`;

        } else {
            // TREND MODE (Weekly Aggregation)
            // Determine days
            const days = range === "90d" ? 90 : range === "30d" ? 30 : range === "14d" ? 14 : 7;

            // Query Weekly Stats
            const result = await query(`
                SELECT 
                    date_trunc('week', measured_at) as week_start,
                    COUNT(*) as count,
                    ROUND(AVG(glucose_mgdl)) as avg_glucose,
                    ROUND(STDDEV(glucose_mgdl)) as variability,
                    MIN(glucose_mgdl) as min_val,
                    MAX(glucose_mgdl) as max_val
                FROM glucose_readings
                WHERE measured_at > now() - interval '${days} days'
                GROUP BY 1
                ORDER BY 1 DESC
            `);

            const weeks = result.rows;
            if (weeks.length === 0) return res.json({ analysis: "Insufficient data for trend analysis." });

            promptData = weeks.map(w =>
                `Week of ${new Date(w.week_start).toLocaleDateString()}: Avg ${w.avg_glucose}, Var ${w.variability}, Min ${w.min_val}, Max ${w.max_val} (Readings: ${w.count})`
            ).join("\n");

            sysPrompt = `
            You are a diabetes expert. Compare these weekly glucose statistics for the last ${range}.
            Identify if control is improving or worsening. Look for changes in variability (Standard Deviation) or Average.
            Highlight specific weeks that look best/worst.
            Format as concise bullet points '•'.
            `;
        }

        if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 10) throw new Error("Missing API Key");

        console.log("[AI] calling OpenAI with aggregated/raw data...");

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o",
                messages: [
                    { role: "system", content: sysPrompt },
                    { role: "user", content: `Data:\n${promptData}` }
                ],
                max_tokens: 300
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENAI_API_KEY}`
                },
                timeout: 15000
            }
        );

        const analysis = response.data.choices[0].message.content;
        res.json({ analysis });

    } catch (err) {
        console.error("AI Error:", err.message);
        res.status(200).json({ analysis: `• ⚠️ AI Error: ${err.message}` });
    }
});
