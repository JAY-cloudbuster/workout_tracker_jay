import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import config from '../config';

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

interface ValidationError extends Error {
  errors: Record<string, { message: string }>;
}

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: Record<string, string[]> | undefined;

  // AppError (our custom errors)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    const validationErr = err as unknown as ValidationError;
    errors = {};
    Object.keys(validationErr.errors).forEach((key) => {
      errors![key] = [validationErr.errors[key].message];
    });
  }

  // Mongoose duplicate key error
  if ((err as MongoError).code === 11000) {
    statusCode = 409;
    const keyValue = (err as MongoError).keyValue;
    const field = keyValue ? Object.keys(keyValue)[0] : 'field';
    message = `A record with this ${field} already exists`;
    errors = { [field]: [`This ${field} is already taken`] };
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error in development
  if (config.env === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(config.env === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
