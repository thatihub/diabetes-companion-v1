export function errorHandler(err, req, res, next) {
    const status = err.status || 500;
    const message = err.message || "An unknown error occurred";

    console.error(`🔥 [${status}] ${req.method} ${req.path} - Error:`, err);

    const response = {
        error: "Server Error",
        message: message,
        path: req.path,
        method: req.method
    };

    // If it looks like a DB error, add more context
    if (message.includes("database") || message.includes("connection") || message.includes("terminat")) {
        response.hint = "Check DATABASE_URL and Supabase connection limits.";
    }

    // Always show message in this phase of debugging
    res.status(status).json(response);
}
