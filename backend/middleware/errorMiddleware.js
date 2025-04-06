const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.name, err.message);
    
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;
    
    // Handle Zod validation errors
    if (err.name === 'ZodError') {
        statusCode = 400;
        // Format Zod errors into a readable message
        const formattedErrors = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        message = formattedErrors.join(', ');
        console.log('Validation error:', message);
    }
    
    // Handle rate limiting errors
    if (err.message.includes('Too many requests')) {
        statusCode = 429;
    }
    
    res.status(statusCode);
    res.json({
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export { errorHandler }; 