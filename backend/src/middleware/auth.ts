import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '@/config/database'
import { getEnv } from '@/config/env'
import { logger, logSecurity } from '@/utils/logger'
import { ApiError } from '@/utils/api-error'

const env = getEnv()

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    isVerified: boolean
    isPremium: boolean
  }
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access token required')
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, env.JWT_SECRET) as any
    
    if (!decoded.userId) {
      throw new ApiError(401, 'Invalid token format')
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        isPremium: true,
        deletedAt: true,
      },
    })

    if (!user) {
      logSecurity('Invalid user token', decoded.userId, req.ip)
      throw new ApiError(401, 'User not found')
    }

    // Check if user account is active
    if (user.deletedAt) {
      logSecurity('Deleted user access attempt', user.id, req.ip)
      throw new ApiError(401, 'Account deactivated')
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isPremium: user.isPremium,
    }

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logSecurity('Invalid JWT token', undefined, req.ip, { error: error.message })
      return next(new ApiError(401, 'Invalid token'))
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(401, 'Token expired'))
    }

    next(error)
  }
}

export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next() // Continue without authentication
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, env.JWT_SECRET) as any
    
    if (decoded.userId) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          isVerified: true,
          isPremium: true,
          deletedAt: true,
        },
      })

      if (user && !user.deletedAt) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          isPremium: user.isPremium,
        }
      }
    }

    next()
  } catch (error) {
    // Ignore auth errors in optional middleware
    next()
  }
}

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'))
    }

    if (!roles.includes(req.user.role)) {
      logSecurity('Unauthorized role access', req.user.id, req.ip, { 
        requiredRoles: roles, 
        userRole: req.user.role 
      })
      return next(new ApiError(403, 'Insufficient permissions'))
    }

    next()
  }
}

export const requireAdmin = requireRole(['ADMIN'])
export const requireModerator = requireRole(['ADMIN', 'MODERATOR'])

export const requireVerified = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'))
  }

  if (!req.user.isVerified) {
    return next(new ApiError(403, 'Email verification required'))
  }

  next()
}

export const requirePremium = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'))
  }

  if (!req.user.isPremium) {
    return next(new ApiError(403, 'Premium subscription required'))
  }

  next()
}

export const rateLimitByUser = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>()

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next()
    }

    const userId = req.user.id
    const now = Date.now()
    const userLimit = userRequests.get(userId)

    if (!userLimit || now > userLimit.resetTime) {
      userRequests.set(userId, {
        count: 1,
        resetTime: now + windowMs,
      })
      return next()
    }

    if (userLimit.count >= maxRequests) {
      logSecurity('Rate limit exceeded', userId, req.ip, { 
        maxRequests, 
        windowMs,
        currentCount: userLimit.count 
      })
      return next(new ApiError(429, 'Too many requests'))
    }

    userLimit.count++
    next()
  }
}