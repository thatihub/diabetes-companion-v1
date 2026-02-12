import './env-setup.js'; // MUST BE FIRST
console.log("DEBUG: Server.js starting...");

// Catch unhandled errors to avoid crash loops without logs
process.on('uncaughtException', (err) => {
    console.error('CRITICAL ERROR (Uncaught Exception):', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL ERROR (Unhandled Rejection):', reason);
});

// Use dynamic imports to avoid module loading hang
(async () => {
    const express = (await import("express")).default;
    const cors = (await import("cors")).default;
    const { healthRouter } = await import("./routes/health.js");
    const { glucoseRouter } = await import("./routes/glucose.js");
    const { insightsRouter } = await import("./routes/insights.js");
    const { dexcomRouter } = await import("./routes/dexcom.js");
    const { errorHandler } = await import("./middleware/errorHandler.js");

    const app = express();
    app.set("trust proxy", 1); // Trust Render's load balancer

    // Render sets PORT for you; local uses .env
    const PORT = process.env.PORT || 4000;

    // Check for critical variables
    const requiredVars = ['DATABASE_URL', 'OPENAI_API_KEY', 'DEXCOM_CLIENT_ID'];
    requiredVars.forEach(v => {
        if (!process.env[v]) {
            console.error(`⚠️  WARNING: Missing environment variable: ${v}`);
        } else {
            console.log(`✅ Environment variable found: ${v} (length: ${process.env[v].length})`);
        }
    });

    console.log(`📡 Internal API Config: PORT=${PORT}`);
    if (process.env.API_URL) {
        console.log(`🔗 Web-to-API Rewrite Target Base: ${process.env.API_URL.substring(0, 20)}...`);
    }

    // Parse JSON with larger limit for trend data
    app.use(express.json({ limit: '5mb' }));

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

    app.get("/", (req, res) => {
        res.json({ message: "Diabetes Companion API is running", env: process.env.NODE_ENV });
    });

    // 404 Handler
    app.use((req, res) => {
        console.warn(`[404] ${req.method} ${req.path}`);
        res.status(404).json({
            error: "Not Found",
            path: req.path,
            method: req.method,
            hint: "Check server.js route prefix configuration"
        });
    });

    // Error handler last
    app.use(errorHandler);

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`✅ Server listening on port ${PORT}`);
    });
})().catch(err => {
    console.error("FATAL: Server startup failed:", err);
    process.exit(1);
});
