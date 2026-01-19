import { Router } from "express";
import { query } from "../db.js";

export const healthRouter = Router();

healthRouter.get("/health", async (req, res) => {
    // optional DB ping
    try {
        await query("select 1 as ok");
        res.json({ ok: true, db: "ok" });
    } catch (e) {
        res.status(500).json({ ok: false, db: "error" });
    }
});
