export function errorHandler(err, req, res, next) {
    console.error("🔥 Error:", err);
    const status = err.status || 500;
    res.status(status).json({
        error: err.publicMessage || "Internal Server Error"
    });
}
