import { Router } from "express";
import axios from "axios";
import { query } from "../db.js";

export const insightsRouter = Router();
const DEMO_SOURCES = ["mock_seed", "mock_events", "demo_manual"];

function isDemoMode(req) {
    return String(req.headers["x-data-mode"] || "").toLowerCase() === "demo";
}

// Retrieve Key
const rawKey = process.env.OPENAI_API_KEY || "";
const OPENAI_API_KEY = rawKey.replace(/^"|"$/g, '').trim();

/**
 * POST /api/insights/analyze-week
 * Body: { title: string, data: [] }
 */
insightsRouter.post("/analyze-week", async (req, res) => {
    console.log(`[AI] analyze-week requested for: ${req.body.title}`);
    const { title, data } = req.body;
    if (!data || data.length === 0) return res.json({ analysis: "No data provided." });

    try {
        const promptData = data.map(r =>
            `- ${r.time}: ${r.glucose_mgdl} mg/dL${r.carbs_grams ? ` (Carbs: ${r.carbs_grams}g)` : ''}${r.insulin_units ? ` (Insulin: ${r.insulin_units}u)` : ''}`
        ).slice(-300).join("\n"); // Limit to last 300 points for context

        const sysPrompt = `
        Analyze this single week of diabetes data (${title}).
        Focus on identifying specific times of day where control is strongest or weakest.
        Correlate carb intake and insulin doses with glucose outcomes.
        Provide 3-4 very concise, actionable bullet points with emojis.
        Keep the tone professional and encouraging.
        `;

        if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 10) throw new Error("Missing API Key");

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o",
                messages: [
                    { role: "system", content: sysPrompt },
                    { role: "user", content: `Weekly Data:\n${promptData}` }
                ],
                max_tokens: 300
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENAI_API_KEY}`
                },
                timeout: 45000
            }
        );

        const analysis = response.data?.choices?.[0]?.message?.content || "AI could not generate a response.";
        res.json({ analysis });

    } catch (err) {
        console.error("AI Week Error:", err.message);
        res.status(200).json({ analysis: `• ⚠️ AI Error: ${err.message}` });
    }
});

insightsRouter.post("/analyze", async (req, res) => {
    const range = req.body.range || "48h";
    console.log(`[AI] analyze requested for range: ${range} - context: ${req.body.context || 'none'}`);
    const demoMode = isDemoMode(req);

    try {
        let promptData = "";
        let sysPrompt = "";

        if (range === "48h" || range === "24h") {
            // DETAILED MODE (Raw Logs)
            const result = demoMode
                ? await query(
                    `select * from glucose_readings 
                     where measured_at > now() - interval '48 hours'
                       and source = ANY($1::text[])
                     order by measured_at desc limit 200`,
                    [DEMO_SOURCES]
                )
                : await query(
                    `select * from glucose_readings 
                     where measured_at > now() - interval '48 hours'
                     order by measured_at desc limit 200`
                );
            const readings = result.rows;
            if (readings.length < 3) return res.json({ analysis: "Insufficient data." });

            promptData = readings.map(r =>
                `- ${new Date(r.measured_at).toLocaleString()}: ${r.glucose_mgdl} mg/dL${r.carbs_grams ? ` (Carbs: ${r.carbs_grams}g)` : ''}${r.insulin_units ? ` (Insulin: ${r.insulin_units}u)` : ''}${r.meal_tag ? ` [Tag: ${r.meal_tag}]` : ''}`
            ).join("\n");

            sysPrompt = `Analyze these raw glucose logs (last 48h). Identify immediate patterns (spikes after meals, drops after insulin). Correlate carb intake and insulin doses with glucose outcomes. Format as bullet points with emojis.`;

        } else {
            // TREND MODE (Weekly Aggregation)
            const days = range === "90d" ? 90 : range === "30d" ? 30 : range === "14d" ? 14 : 7;

            const result = demoMode
                ? await query(`
                    SELECT 
                        date_trunc('week', measured_at) as week_start,
                        COUNT(*) as count,
                        ROUND(AVG(glucose_mgdl)) as avg_glucose,
                        ROUND(STDDEV(glucose_mgdl)) as variability,
                        SUM(COALESCE(carbs_grams, 0)) as total_carbs,
                        SUM(COALESCE(insulin_units, 0)) as total_insulin,
                        MIN(glucose_mgdl) as min_val,
                        MAX(glucose_mgdl) as max_val
                    FROM glucose_readings
                    WHERE measured_at > now() - interval '${days} days'
                      AND source = ANY($1::text[])
                    GROUP BY 1
                    ORDER BY 1 DESC
                `, [DEMO_SOURCES])
                : await query(`
                    SELECT 
                        date_trunc('week', measured_at) as week_start,
                        COUNT(*) as count,
                        ROUND(AVG(glucose_mgdl)) as avg_glucose,
                        ROUND(STDDEV(glucose_mgdl)) as variability,
                        SUM(COALESCE(carbs_grams, 0)) as total_carbs,
                        SUM(COALESCE(insulin_units, 0)) as total_insulin,
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
                `Week of ${new Date(w.week_start).toLocaleDateString()}: Avg ${w.avg_glucose}mg/dL, Var ${w.variability}, Carbs ${w.total_carbs}g, Insulin ${w.total_insulin}u, Min ${w.min_val}, Max ${w.max_val} (${w.count} logs)`
            ).join("\n");

            sysPrompt = `
            You are a diabetes expert. Use this weekly data (glucose averages, variability, total carbs, and total insulin) to analyze patterns over the last ${range}.
            Identify if the insulin-to-carb ratio seems to be working by looking at how averages change relative to total carbs/insulin.
            Look for changes in variability (Standard Deviation).
            Provide actionable insights in bullet points '•'.
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
                timeout: 45000
            }
        );

        const analysis = response.data?.choices?.[0]?.message?.content || "AI could not generate a response.";
        res.json({ analysis });

    } catch (err) {
        console.error("AI Error:", err.message);
        res.status(200).json({ analysis: `• ⚠️ AI Error: ${err.message}` });
    }
});

/**
 * POST /api/insights/tts
 * Body: { text: string, voice?: string }
 * Returns: audio/mpeg stream
 */
insightsRouter.post("/tts", async (req, res) => {
    const { text, voice = "nova" } = req.body || {};

    if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ error: "Text is required." });
    }

    if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 10) {
        return res.status(500).json({ error: "Missing OPENAI_API_KEY." });
    }

    const cleanedText = text.trim().slice(0, 4000);
    const chosenVoice = String(voice).toLowerCase();

    const tryModels = ["gpt-4o-mini-tts", "tts-1"];

    try {
        let audioData = null;

        for (const model of tryModels) {
            try {
                const response = await axios.post(
                    "https://api.openai.com/v1/audio/speech",
                    {
                        model,
                        voice: chosenVoice,
                        input: cleanedText,
                        response_format: "mp3"
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${OPENAI_API_KEY}`,
                            "Accept": "audio/mpeg"
                        },
                        responseType: "arraybuffer",
                        timeout: 60000
                    }
                );
                audioData = response.data;
                break;
            } catch (innerErr) {
                console.warn(`[AI TTS] Model ${model} failed:`, innerErr?.response?.status || innerErr?.message);
            }
        }

        if (!audioData) {
            throw new Error("OpenAI TTS failed for all models.");
        }

        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Cache-Control", "no-store");
        return res.send(Buffer.from(audioData));
    } catch (err) {
        console.error("[AI TTS] Error:", err.message);
        return res.status(502).json({ error: `TTS failed: ${err.message}` });
    }
});

/**
 * POST /api/insights/meal-estimate
 * Body: { imageData: "data:image/jpeg;base64,..." }
 * Returns: { totals: { carbs_g, protein_g, fat_g }, items: [{name, carbs_g, protein_g, fat_g}], notes }
 */
insightsRouter.post("/meal-estimate", async (req, res) => {
    const { imageData } = req.body || {};

    if (!imageData || typeof imageData !== "string" || !imageData.startsWith("data:image/")) {
        return res.status(400).json({ error: "imageData (data:image/* base64) is required." });
    }

    if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 10) {
        return res.status(500).json({ error: "Missing OPENAI_API_KEY." });
    }

    const systemPrompt = `
You are a nutrition estimation assistant.
Given one meal image, estimate approximate macros.
Return ONLY valid JSON in this exact shape:
{
  "totals": { "carbs_g": number, "protein_g": number, "fat_g": number },
  "items": [{ "name": string, "carbs_g": number, "protein_g": number, "fat_g": number }],
  "notes": string,
  "confidence": "low" | "medium" | "high"
}
Rules:
- Numbers must be non-negative.
- Keep estimates realistic and conservative.
- If unsure, still provide best estimate and mention uncertainty in notes.
- Use grams for all macros.
`.trim();

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini",
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: systemPrompt },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Estimate carbs, protein, and fat for this meal photo." },
                            { type: "image_url", image_url: { url: imageData } }
                        ]
                    }
                ],
                temperature: 0.2,
                max_tokens: 600
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENAI_API_KEY}`
                },
                timeout: 60000
            }
        );

        const raw = response.data?.choices?.[0]?.message?.content || "{}";
        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch {
            return res.status(502).json({ error: "AI response was not valid JSON." });
        }

        const totals = parsed?.totals || {};
        const safeNum = (v) => {
            const n = Number(v);
            return Number.isFinite(n) && n >= 0 ? Number(n.toFixed(1)) : 0;
        };

        const normalizedItems = Array.isArray(parsed?.items)
            ? parsed.items.map((it) => ({
                name: String(it?.name || "Unknown item"),
                carbs_g: safeNum(it?.carbs_g),
                protein_g: safeNum(it?.protein_g),
                fat_g: safeNum(it?.fat_g),
            }))
            : [];

        const normalized = {
            totals: {
                carbs_g: safeNum(totals?.carbs_g),
                protein_g: safeNum(totals?.protein_g),
                fat_g: safeNum(totals?.fat_g),
            },
            items: normalizedItems,
            notes: String(parsed?.notes || "AI estimated from meal photo."),
            confidence: ["low", "medium", "high"].includes(String(parsed?.confidence))
                ? parsed.confidence
                : "medium",
        };

        return res.json(normalized);
    } catch (err) {
        console.error("[Meal Estimate] Error:", err.message);
        return res.status(502).json({ error: `Meal estimate failed: ${err.message}` });
    }
});
