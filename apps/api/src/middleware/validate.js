export function requireFields(fields) {
    return function (req, res, next) {
        console.log("DEBUG: Middleware requireFields checking:", fields);
        const missing = [];
        for (const f of fields) {
            if (req.body?.[f] === undefined || req.body?.[f] === null || req.body?.[f] === "") {
                missing.push(f);
            }
        }
        if (missing.length) {
            console.log("DEBUG: Missing fields", missing);
            return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
        }
        console.log("DEBUG: requireFields passed");
        next();
    };
}

// basic numeric bounds for glucose mg/dL
export function validateGlucose(req, res, next) {
    const v = Number(req.body.glucose_mgdl);
    if (!Number.isFinite(v)) return res.status(400).json({ error: "glucose_mgdl must be a number" });
    if (v < 20 || v > 600) return res.status(400).json({ error: "glucose_mgdl out of range (20-600)" });
    next();
}
