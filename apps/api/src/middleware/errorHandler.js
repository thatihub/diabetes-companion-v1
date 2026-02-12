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

    if (process.env.NODE_ENV !== 'production') {
        response.stack = err.stack;
    }

    res.status(status).json(response);
}
