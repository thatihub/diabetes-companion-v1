export function errorHandler(err, req, res, next) {
    console.error("🔥 Error:", err);
    const status = err.status || 500;
    const response = {
        error: "Server Error",
        message: err.message || "An unknown error occurred"
    };

    if (process.env.NODE_ENV !== 'production') {
        response.stack = err.stack;
    }

    res.status(status).json(response);
}
