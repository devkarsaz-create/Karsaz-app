import { Request, Response, NextFunction } from 'express'
import { logger, logRequest } from '@/utils/logger'
import { AuthenticatedRequest } from './auth'

export const requestLogger = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const startTime = Date.now()
  
  // Log request
  logRequest(req.method, req.originalUrl, req.user?.id, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
  })

  // Override res.end to log response
  const originalEnd = res.end
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - startTime
    
    logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: res.get('Content-Length'),
    })

    // Call the original end method
    originalEnd.call(this, chunk, encoding)
  }

  next()
}