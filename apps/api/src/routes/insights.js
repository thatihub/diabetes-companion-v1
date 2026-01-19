import { Router } from "express";
import OpenAI from "openai";

export const insightsRouter = Router();

// OpenAI Client (Optional - will fallback to Rule-based if key is missing)
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

/**
 * POST /api/insights/generate
 * Body: { readings: glucoseReading[] }
 */
insightsRouter.post("/insights/generate", async (req, res, next) => {
    try {
        const { readings } = req.body;

        if (!readings || readings.length === 0) {
            return res.status(400).json({ error: "No readings provided for analysis" });
        }

        // 1. ALWAYS Run Rule-Based Analysis (as fallback or ground truth)
        const ruleBased = performRuleAnalysis(readings);

        // 2. Try AI if Key exists
        if (openai) {
            try {
                const aiInsight = await generateAIInsight(readings);
                return res.json(aiInsight);
            } catch (err) {
                console.error("AI Insight Error, falling back to Rules:", err.message);
            }
        }

        // 3. Fallback to Rule-Based
        res.json(ruleBased);

    } catch (err) {
        next(err);
    }
});

/**
 * Robust Rule-Based Insight Engine
 */
function performRuleAnalysis(readings) {
    const avg = readings.reduce((acc, r) => acc + r.glucose_mgdl, 0) / readings.length;
    const lows = readings.filter(r => r.glucose_mgdl < 70);
    const highs = readings.filter(r => r.glucose_mgdl > 140);
    const carbHighs = readings.filter(r => r.carbs_g > 50 && r.glucose_mgdl > 140);
    const latest = readings[0];

    let summary = "";
    let suggestion = "";
    let status = "normal";

    const disclaimer = "Educational analysis only. Consult your doctor for medical advice.";

    if (lows.length > 0) {
        status = "low";
        summary = `I noticed ${lows.length} reading(s) below 70 mg/dL. Hypoglycemia can make you feel shaky or dizzy.`;
        suggestion = "Always keep a fast-acting carb (like glucose tabs or juice) nearby. Check if these lows happen at a specific time of day.";
    } else if (highs.length > 3 || avg > 150) {
        status = "warning";
        summary = `Your average glucose is ${Math.round(avg)} mg/dL, which is slightly above target. Trends show several readings in the higher range.`;
        suggestion = "Try tracking which specific meals precede these spikes. Adding 10 minutes of light walking after meals may help lower these numbers.";
    } else if (carbHighs.length > 0) {
        status = "warning";
        summary = "You seem to have higher spikes when meals exceed 50g of carbohydrates.";
        suggestion = "Consider 'carb pairing' (eating fiber/fat/protein before carbs) to see if it blunts the glucose response.";
    } else {
        summary = `Solid progress! Your average of ${Math.round(avg)} mg/dL and current trends show you are managing your levels well.`;
        suggestion = "Consistency is key. Keep logging your activity and meals to help the AI spot even more subtle patterns.";
    }

    return { summary, suggestion, status, disclaimer };
}

/**
 * OpenAI Insight Generator
 */
async function generateAIInsight(readings) {
    const prompt = `
    Analyze the following glucose readings for a person with diabetes.
    Provide a reflection on patterns and an educational suggestion.
    
    Data: ${JSON.stringify(readings.slice(0, 20))}
    
    Return ONLY a JSON object with this structure:
    {
      "summary": "Short 2-3 sentence reflection on trends",
      "suggestion": "Educational lifestyle tip (not medical advice)",
      "status": "low", "warning", or "normal",
      "disclaimer": "Educational analysis only. Consult your doctor for medical advice."
    }
    `;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
}
