import { Router } from "express";
import { query } from "../db.js";

export const healthRouter = Router();

healthRouter.get("/status", (req, res) => {
    res.json({ status: "Express is alive", version: "1.2.3", timestamp: new Date().toISOString() });
});

healthRouter.get("/health", async (req, res) => {
    try {
        await query("select 1 as ok");
        res.json({ ok: true, db: "connected", version: "1.2.3" });
    } catch (e) {
        console.error("Health check DB error:", e);
        res.status(500).json({
            ok: false,
            db: "error",
            message: e.message,
            stack: e.stack // Expose stack for deep debugging
        });
    }
});
