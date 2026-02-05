import { Router } from "express";
import { query } from "../db.js";
import { requireFields, validateGlucose } from "../middleware/validate.js";

export const glucoseRouter = Router();

/**
 * POST /api/glucose
 * Body: { glucose_mgdl: number, measured_at?: ISO string, notes?: string, meal_tag?: string, carbs_grams?: number, insulin_units?: number }
 */
glucoseRouter.post(
    "/glucose",
    // requireFields(["glucose_mgdl"]),
    // validateGlucose,
    async (req, res, next) => {
        console.log("DEBUG: Entering POST /glucose handler");
        try {
            console.log("DEBUG: Request body type:", typeof req.body);
            console.log("DEBUG: Request body content:", req.body);

            const { glucose_mgdl, measured_at, notes, meal_tag, carbs_grams, insulin_units } = req.body;
            console.log("DEBUG: Parsed vars", { glucose_mgdl, measured_at });

            console.log("DEBUG: Executing parameterized query...");
            const result = await query(
                `insert into glucose_readings (glucose_mgdl, measured_at, notes, meal_tag, carbs_grams, insulin_units)
         values ($1, coalesce($2::timestamptz, now()), $3, $4, $5, $6)
         ON CONFLICT (measured_at) DO NOTHING
         returning *`,
                [glucose_mgdl, measured_at || null, notes || null, meal_tag || null, carbs_grams || null, insulin_units || null]
            );
            console.log("DEBUG: Query Executed. Rows:", result.rowCount);

            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error("DEBUG: Caught error in handler", err);
            next(err);
        }
    }
);

/**
 * GET /api/glucose?limit=50&hours=24
 */
glucoseRouter.get("/glucose", async (req, res, next) => {
    try {
        const limit = req.query.limit ? Math.min(Number(req.query.limit), 50000) : 1000;
        const hours = req.query.hours ? Number(req.query.hours) : null;

        let queryText = `select * from glucose_readings`;
        const params = [];

        if (hours) {
            queryText += ` where measured_at > now() - interval '${hours} hours'`;
        }

        queryText += ` order by measured_at desc limit $${params.length + 1}`;
        params.push(limit);

        const result = await query(queryText, params);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /api/glucose/:id
 */
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
