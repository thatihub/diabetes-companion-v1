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
            const { glucose_mgdl, measured_at, notes, meal_tag } = req.body;

            const result = await query(
                `insert into glucose_logs (glucose_mgdl, measured_at, notes, meal_tag)
         values ($1, coalesce($2::timestamptz, now()), $3, $4)
         returning *`,
                [glucose_mgdl, measured_at || null, notes || null, meal_tag || null]
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
            `select * from glucose_logs
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
            `delete from glucose_logs where id = $1 returning id`,
            [id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
        res.json({ deleted: result.rows[0].id });
    } catch (err) {
        next(err);
    }
});
