import './env-setup.js'; // MUST BE FIRST
console.log("DEBUG: Server.js starting...");

import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.js";
import { glucoseRouter } from "./routes/glucose.js";
import { insightsRouter } from "./routes/insights.js";
import { dexcomRouter } from "./routes/dexcom.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Catch unhandled errors to avoid crash loops without logs
process.on('uncaughtException', (err) => {
    console.error('CRITICAL ERROR (Uncaught Exception):', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL ERROR (Unhandled Rejection):', reason);
});

const app = express();
app.set("trust proxy", 1); // Trust Render's load balancer

// Render sets PORT for you; local uses .env
const PORT = process.env.PORT || 4000;

// Parse JSON
app.use(express.json());

// CORS — Allow All Origins (for now)
app.use(cors());

// Debug Logging
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.path}`);
    next();
});

// Routes
app.use("/", healthRouter);
app.use("/api", glucoseRouter);
app.use("/api/insights", insightsRouter);
app.use("/api/dexcom", dexcomRouter);

// Simple root
app.get("/", (req, res) => {
    res.send("Diabetes Companion API is running.");
});

// Error handler last
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server listening on port ${PORT}`);
});
