export function errorHandler(err, req, res, next) {
    console.error("🔥 Error:", err);
    const status = err.status || 500;
    res.setHeader('Content-Type', 'application/json');
    res.status(status).json({
        error: "Server Error",
        message: err.message || "An unknown error occurred",
        stack: err.stack,
        hint: "Check DATABASE_URL and Render Environment Variables"
    });
}
