const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  
  console.error("Express Error Handler Captured:", err);

  
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new Error(message);
    error.statusCode = 404;
  }

  
  if (err.code === 11000) {
    const message = `Duplicate field value entered. Please choose another one.`;
    error = new Error(message);
    error.statusCode = 400;
  }

  
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new Error(message);
    error.statusCode = 400;
  }

  
  if (err.name === 'JsonWebTokenError') {
    const message = 'Not authorized, invalid token';
    error = new Error(message);
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Not authorized, token has expired';
    error = new Error(message);
    error.statusCode = 401;
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
