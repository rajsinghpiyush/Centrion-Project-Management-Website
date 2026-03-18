export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    if (process.env.NODE_ENV === 'development') console.error('Error:', err);

    if (err.name === 'CastError') error = new AppError('Resource not found', 404);
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error = new AppError(`${field.charAt(0).toUpperCase() + field.slice(1)} already exists`, 400);
    }
    if (err.name === 'ValidationError') error = new AppError(Object.values(err.errors).map(v => v.message).join(', '), 400);
    if (err.name === 'JsonWebTokenError') error = new AppError('Invalid token', 401);
    if (err.name === 'TokenExpiredError') error = new AppError('Token expired', 401);

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export const notFound = (req, res, next) => {
    next(new AppError(`Route not found - ${req.originalUrl}`, 404));
};
