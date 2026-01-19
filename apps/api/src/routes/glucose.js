import { Router } from "express";
import { query } from "../db.js";
import { requireFields, validateGlucose } from "../middleware/validate.js";

export const glucoseRouter = Router();

/**
 * POST /api/glucose
 * Body: { glucose_mgdl: number, measured_at?: ISO string, notes?: string, meal_tag?: string }
 */
glucoseRouter.post(
    "/glucose",
    requireFields(["glucose_mgdl"]),
    validateGlucose,
    async (req, res, next) => {
        try {
            const { glucose_mgdl, measured_at, notes, meal_tag, carbs_g, activity_min } = req.body;

            const result = await query(
                `insert into glucose_readings (glucose_mgdl, measured_at, notes, meal_tag, carbs_g, activity_min)
         values ($1, coalesce($2::timestamptz, now()), $3, $4, $5, $6)
         returning *`,
                [glucose_mgdl, measured_at || null, notes || null, meal_tag || null, carbs_g || null, activity_min || null]
            );

            res.status(201).json(result.rows[0]);
        } catch (err) {
            next(err);
        }
    }
);

/**
 * GET /api/glucose?limit=50
 */
glucoseRouter.get("/glucose", async (req, res, next) => {
    try {
        const limit = Math.min(Number(req.query.limit || 50), 200);
        const result = await query(
            `select * from glucose_readings
       order by measured_at desc
       limit $1`,
            [limit]
        );
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
}
);

/**
 * PUT /api/glucose/:id
 */
glucoseRouter.put("/glucose/:id", validateGlucose, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { glucose_mgdl, notes, meal_tag, carbs_g, activity_min } = req.body;

        const result = await query(
            `update glucose_readings 
       set glucose_mgdl = $1, notes = $2, meal_tag = $3, carbs_g = $4, activity_min = $5, updated_at = now()
       where id = $6 
       returning *`,
            [glucose_mgdl, notes || null, meal_tag || null, carbs_g || null, activity_min || null, id]
        );

        if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});
