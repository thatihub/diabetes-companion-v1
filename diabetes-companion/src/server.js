import express from "express";
import dotenv from "dotenv";
import { healthRouter } from "./routes/health.js";
import { glucoseRouter } from "./routes/glucose.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config(); // local only; Render env vars override automatically

const app = express();

// Render sets PORT for you; local uses .env
const PORT = process.env.PORT || 3000;

// Parse JSON
app.use(express.json());

// Routes
app.use("/", healthRouter);
app.use("/api", glucoseRouter);

// Simple root
app.get("/", (req, res) => {
    res.send("Diabetes Companion API is running.");
});

// Error handler last
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server listening on port ${PORT}`);
});
