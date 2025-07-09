import { Request, Response, NextFunction } from 'express';

/**
 * Global error handling middleware for Express.
 * Catches and processes errors thrown in the application, including validation errors,
 * MongoDB duplicate key errors, and generic server errors.
 * Responds with appropriate HTTP status codes and error messages.
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }

  if (err.name === 'MongoError' && (err as any).code === 11000) {
    return res.status(409).json({
      error: 'Duplicate Error',
      details: 'A record with this value already exists'
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};