import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { logger, logError } from '@/utils/logger'
import { ApiError } from '@/utils/api-error'

export interface ErrorResponse {
  error: string
  message: string
  statusCode: number
  timestamp: string
  path: string
  details?: any
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500
  let message = 'Internal server error'
  let details: any = undefined

  // Log the error
  logError('Request error', error, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  })

  // Handle different types of errors
  if (error instanceof ApiError) {
    statusCode = error.statusCode
    message = error.message
    details = error.details
  } else if (error instanceof ZodError) {
    statusCode = 400
    message = 'Validation error'
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }))
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        statusCode = 409
        message = 'Duplicate entry'
        details = {
          field: error.meta?.target,
          constraint: 'unique_constraint',
        }
        break
      case 'P2025':
        statusCode = 404
        message = 'Record not found'
        break
      case 'P2003':
        statusCode = 400
        message = 'Foreign key constraint failed'
        details = {
          field: error.meta?.field_name,
        }
        break
      case 'P2014':
        statusCode = 400
        message = 'Invalid relation'
        break
      default:
        statusCode = 400
        message = 'Database error'
        details = {
          code: error.code,
          meta: error.meta,
        }
    }
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500
    message = 'Unknown database error'
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = 500
    message = 'Database connection error'
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 500
    message = 'Database initialization error'
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400
    message = 'Database validation error'
  } else if (error.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation error'
    details = error.message
  } else if (error.name === 'CastError') {
    statusCode = 400
    message = 'Invalid data format'
    details = error.message
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  } else if (error.name === 'MulterError') {
    statusCode = 400
    switch (error.message) {
      case 'File too large':
        message = 'File size too large'
        break
      case 'Too many files':
        message = 'Too many files uploaded'
        break
      case 'Unexpected field':
        message = 'Unexpected file field'
        break
      default:
        message = 'File upload error'
    }
  }

  // Create error response
  const errorResponse: ErrorResponse = {
    error: error.name || 'Error',
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
  }

  // Include details in development mode
  if (process.env.NODE_ENV === 'development' && details) {
    errorResponse.details = details
  }

  // Include stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = {
      ...errorResponse.details,
      stack: error.stack,
    }
  }

  res.status(statusCode).json(errorResponse)
}

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  const errorResponse: ErrorResponse = {
    error: 'NotFound',
    message: 'Route not found',
    statusCode: 404,
    timestamp: new Date().toISOString(),
    path: req.path,
  }

  res.status(404).json(errorResponse)
}

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}