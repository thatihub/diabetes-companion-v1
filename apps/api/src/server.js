import 'dotenv/config';
import express from "express";
import { healthRouter } from "./routes/health.js";
import { glucoseRouter } from "./routes/glucose.js";
import { insightsRouter } from "./routes/insights.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Render sets PORT for you; local uses .env
const PORT = process.env.PORT || 4000;

// Parse JSON
app.use(express.json());

// CORS — allow frontend to call backend (allow all origins for local dev)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
});

// Routes
app.use("/", healthRouter);
app.use("/api", glucoseRouter);
app.use("/api", insightsRouter);

// Simple root
app.get("/", (req, res) => {
    res.send("Diabetes Companion API is running.");
});

// Error handler last
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server listening on port ${PORT}`);
});
