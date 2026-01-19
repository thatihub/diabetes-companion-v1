
import { Router } from "express";
import { OpenAI } from "openai";
import { query } from "../db.js";

export const insightsRouter = Router();

// Initialize OpenAI key
// Note: Ensure OPENAI_API_KEY is in .env 
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/insights/analyze
 * Analyzes the last 48 hours of data
 */
insightsRouter.post("/analyze", async (req, res, next) => {
    try {
        // 1. Fetch recent data (last 48h)
        const result = await query(
            `select * from glucose_readings 
             where measured_at > now() - interval '48 hours'
             order by measured_at desc`
        );
        const readings = result.rows;

        // 2. Prepare prompt
        if (readings.length < 3) {
            return res.json({ analysis: "Not enough data to analyze. Please log more readings!" });
        }

        const formattedData = readings.map(r =>
            `- ${new Date(r.measured_at).toLocaleString()}: ${r.glucose_mgdl} mg/dL, Carbs: ${r.carbs_grams || 0}g, Insulin: ${r.insulin_units || 0}u ${r.meal_tag ? `(${r.meal_tag})` : ''}`
        ).join("\n");

        const prompt = `
        You are a helpful, encouraging diabetes assistant. Analyze these glucose logs from the last 48 hours.
        Identify 1-2 key patterns (e.g., specific times of high/low, response to carbs).
        Keep it brief (max 3 sentences). Be encouraging.
        
        Data:
        ${formattedData}
        `;

        // 3. Call GPT-4o
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // or gpt-3.5-turbo if cost is concern, but gpt-4o is smarter
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150,
        });

        const analysis = completion.choices[0].message.content;

        res.json({ analysis });

    } catch (err) {
        console.error("AI Error:", err);
        // Return actual error for debugging
        res.status(500).json({ error: err.message || "Failed to generate insights" });
    }
});
