import winston from 'winston'
import { getEnv } from '@/config/env'

const env = getEnv()

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

// Tell winston that you want to link the colors
winston.addColors(colors)

// Define which logs to print based on environment
const level = () => {
  const isDevelopment = env.NODE_ENV === 'development'
  return isDevelopment ? 'debug' : 'warn'
}

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
)

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
]

// Create the logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false,
})

// Create a stream object for Morgan HTTP logger
export const loggerStream = {
  write: (message: string) => {
    logger.http(message.trim())
  },
}

// Helper functions for structured logging
export const logError = (message: string, error?: any, meta?: any) => {
  logger.error(message, {
    error: error?.message || error,
    stack: error?.stack,
    ...meta,
  })
}

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta)
}

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta)
}

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta)
}

// Performance logging
export const logPerformance = (operation: string, startTime: number, meta?: any) => {
  const duration = Date.now() - startTime
  logger.info(`Performance: ${operation} completed in ${duration}ms`, {
    operation,
    duration,
    ...meta,
  })
}

// Database query logging
export const logQuery = (query: string, params?: any, duration?: number) => {
  logger.debug('Database Query', {
    query,
    params,
    duration,
  })
}

// API request logging
export const logRequest = (method: string, url: string, userId?: string, meta?: any) => {
  logger.http(`${method} ${url}`, {
    method,
    url,
    userId,
    ...meta,
  })
}

// Security logging
export const logSecurity = (event: string, userId?: string, ip?: string, meta?: any) => {
  logger.warn(`Security Event: ${event}`, {
    event,
    userId,
    ip,
    timestamp: new Date().toISOString(),
    ...meta,
  })
}