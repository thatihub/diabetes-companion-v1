import { Router } from "express";
import { query } from "../db.js";
import { requireFields, validateGlucose } from "../middleware/validate.js";

export const glucoseRouter = Router();

/**
 * GET /api/ping
 * Used to verify if the API is reachable through the proxy without DB overhead.
 */
glucoseRouter.get("/ping", (req, res) => {
    res.json({ message: "API Pong", timestamp: new Date().toISOString() });
});

glucoseRouter.post(
    "/glucose",
    // requireFields(["glucose_mgdl"]),
    // validateGlucose,
    async (req, res, next) => {
        try {
            const { glucose_mgdl, measured_at, notes, meal_tag, carbs_grams, insulin_units } = req.body;

            const result = await query(
                `insert into glucose_readings (glucose_mgdl, measured_at, notes, meal_tag, carbs_grams, insulin_units)
         values ($1, coalesce($2::timestamptz, now()), $3, $4, $5, $6)
         ON CONFLICT (measured_at) DO NOTHING
         returning *`,
                [glucose_mgdl, measured_at || null, notes || null, meal_tag || null, carbs_grams || null, insulin_units || null]
            );

            res.status(201).json(result.rows[0]);
        } catch (err) {
            next(err);
        }
    }
);

/**
 * GET /api/glucose?limit=50&hours=24
 */
glucoseRouter.get("/glucose", async (req, res, next) => {
    try {
        let limit = req.query.limit ? Number(req.query.limit) : 1000;
        if (isNaN(limit) || limit < 1) limit = 1000;
        // Cap limit to prevent massive fetches causing timeouts
        limit = Math.min(limit, 50000);

        let hours = req.query.hours ? Number(req.query.hours) : null;
        if (hours !== null && (isNaN(hours) || hours <= 0)) hours = null; // Ensure valid positive number

        let queryText = `SELECT * FROM glucose_readings`;
        const params = [];
        const conditions = [];

        if (hours) {
            // Safe to inject number directly as we validated it above, or use parameter
            // Using direct interval string for simplicity with Postgres syntax
            conditions.push(`measured_at > now() - interval '${hours} hours'`);
        }

        if (conditions.length > 0) {
            queryText += ` WHERE ${conditions.join(" AND ")}`;
        }

        // Add sorting
        queryText += ` ORDER BY measured_at DESC`;

        // Add limit (always strictly parameterized)
        params.push(limit);
        queryText += ` LIMIT $${params.length}`;

        console.log(`[DB QUERY] ${queryText} (Params: ${params})`); // Debug log

        const result = await query(queryText, params);
        res.json(result.rows);
    } catch (err) {
        // Enhance error for debugging
        console.error("Database Query Failed:", err);
        next(err);
    }
});
glucoseRouter.delete("/glucose/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await query(
            `delete from glucose_readings where id = $1 returning id`,
            [id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
        res.json({ deleted: result.rows[0].id });
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /api/glucose/:id
 */
glucoseRouter.put("/glucose/:id", validateGlucose, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { glucose_mgdl, notes, meal_tag, carbs_grams, insulin_units } = req.body;

        const result = await query(
            `update glucose_readings 
       set glucose_mgdl = $1, notes = $2, meal_tag = $3, carbs_grams = $4, insulin_units = $5, updated_at = now()
       where id = $6 
       returning *`,
            [glucose_mgdl, notes || null, meal_tag || null, carbs_grams || null, insulin_units || null, id]
        );

        if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});
