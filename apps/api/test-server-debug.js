import './src/env-setup.js';
console.log("DEBUG: Server.js starting...");

import express from "express";
console.log("✅ Express imported");

import cors from "cors";
console.log("✅ CORS imported");

import { healthRouter } from "./src/routes/health.js";
console.log("✅ Health router imported");

import { glucoseRouter } from "./src/routes/glucose.js";
console.log("✅ Glucose router imported");

import { insightsRouter } from "./src/routes/insights.js";
console.log("✅ Insights router imported");

import { dexcomRouter } from "./src/routes/dexcom.js";
console.log("✅ Dexcom router imported");

import { errorHandler } from "./src/middleware/errorHandler.js";
console.log("✅ Error handler imported");

const app = express();
console.log("✅ Express app created");

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.use("/", healthRouter);
app.use("/api", glucoseRouter);
app.use("/api/insights", insightsRouter);
app.use("/api/dexcom", dexcomRouter);

app.get("/", (req, res) => {
    res.send("Diabetes Companion API is running.");
});

app.use(errorHandler);

console.log("✅ About to start listening...");

app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server listening on port ${PORT}`);
});
