
import { Router } from "express";
import { OpenAI } from "openai";
import { query } from "../db.js";

export const insightsRouter = Router();

// Initialize OpenAI key
// Note: Ensure OPENAI_API_KEY is in .env 
const apiKey = process.env.OPENAI_API_KEY;
console.log("Insights Router Loaded. API Key present:", !!apiKey, apiKey ? `(Length: ${apiKey.length})` : "");
if (apiKey) console.log(`API Key preview: ${apiKey.substring(0, 35)}...`);

const openai = new OpenAI({
    apiKey: apiKey || "dummy_key_to_prevent_instantiation_error", // Prevent immediate throw if missing, will fail on call
});

/**
 * POST /api/insights/analyze
 * Analyzes glucose data.
 * Body: { startDate?, endDate?, context? }
 * - Default: Last 48 hours
 * - context: "comparative" | "weekly" | "general" (influences the system prompt)
 */
insightsRouter.post("/analyze", async (req, res, next) => {
    console.log("POST /api/insights/analyze received", req.body);
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.error("Missing OPENAI_API_KEY");
            return res.status(500).json({ error: "Server Configuration Error: Missing OpenAI API Key" });
        }

        const { startDate, endDate, context } = req.body;
        let readings;

        // 1. Fetch data based on range or default
        if (startDate && endDate) {
            console.log(`Fetching data from ${startDate} to ${endDate}...`);
            const result = await query(
                `select * from glucose_readings 
                 where measured_at >= $1 and measured_at <= $2
                 order by measured_at desc`,
                [startDate, endDate]
            );
            readings = result.rows;
        } else {
            console.log("Fetching default recent data (48h)...");
            const result = await query(
                `select * from glucose_readings 
                 where measured_at > now() - interval '48 hours'
                 order by measured_at desc`
            );
            readings = result.rows;
        }

        console.log(`Fetched ${readings.length} readings.`);

        // 2. Prepare prompt
        if (readings.length < 3) {
            console.log("Not enough data.");
            return res.json({ analysis: "Not enough data in this range to analyze. Please log more readings!" });
        }

        const formattedData = readings.map(r =>
            `- ${new Date(r.measured_at).toLocaleString()}: ${r.glucose_mgdl} mg/dL, Carbs: ${r.carbs_grams || 0}g, Insulin: ${r.insulin_units || 0}u ${r.meal_tag ? `(${r.meal_tag})` : ''}`
        ).join("\n");

        let systemInstruction = "You are a helpful, encouraging diabetes assistant.";
        if (context === "weekly") {
            systemInstruction += " Analyze this specific week of data. Identify patterns relative to a typical week. Focus on overall stability and key events.";
        } else if (context === "comparison") {
            systemInstruction += " Analyze these weeks of data to identify broad trends. Compare patterns across the weeks if obvious (e.g. 'Last week was more stable').";
        } else {
            systemInstruction += " Analyze these glucose logs from the recent period.";
        }


        const prompt = `
        ${systemInstruction}
        Identify 2-3 key patterns (e.g., overnight trends, response to carbs, pre-meal spikes).
        Format your response as a clean bulleted list (use '•').
        Keep each point concise (1 sentence). Be encouraging.
        Start directly with the first bullet.
        
        Data:
        ${formattedData}
        `;

        // 3. Call GPT-4o
        console.log("Calling OpenAI...");
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 200, // Increased slightly for potentially complex comparison
        });
        console.log("OpenAI response received.");

        const analysis = completion.choices[0].message.content;

        res.json({ analysis });

    } catch (err) {
        console.error("AI Error:", err);
        // Return actual error for debugging
        res.status(500).json({ error: err.message || "Failed to generate insights" });
    }
});
