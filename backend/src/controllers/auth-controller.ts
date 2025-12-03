import { Request, Response } from 'express'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { prisma } from '@/config/database'
import { getEnv } from '@/config/env'
import { ApiError } from '@/utils/api-error'
import { logger, logSecurity } from '@/utils/logger'
import { AuthenticatedRequest } from '@/middleware/auth'
import { emailService } from '@/services/email-service'
import { smsService } from '@/services/sms-service'
import { cacheService } from '@/config/redis'

const env = getEnv()

class AuthController {
  async register(req: Request, res: Response) {
    const { email, password, fullName, phone } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(phone ? [{ phone }] : []),
        ],
      },
    })

    if (existingUser) {
      if (existingUser.email === email) {
        throw ApiError.conflict('Email already registered')
      }
      if (existingUser.phone === phone) {
        throw ApiError.conflict('Phone number already registered')
      }
    }

    // Hash password
    const hashedPassword = await argon2.hash(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phone,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        isVerified: true,
        isPremium: true,
        role: true,
        createdAt: true,
      },
    })

    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: user.id, type: 'email_verification' },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Send verification email
    await emailService.sendVerificationEmail(email, verificationToken)

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id)

    logger.info(`User registered: ${user.email}`)

    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification.',
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    })
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        fullName: true,
        phone: true,
        isVerified: true,
        isPremium: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user || !user.password) {
      logSecurity('Failed login attempt', undefined, req.ip, { email })
      throw ApiError.unauthorized('Invalid credentials')
    }

    // Verify password
    const isValidPassword = await argon2.verify(user.password, password)
    if (!isValidPassword) {
      logSecurity('Failed login attempt', user.id, req.ip, { email })
      throw ApiError.unauthorized('Invalid credentials')
    }

    // Update last seen
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    })

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    logger.info(`User logged in: ${user.email}`)

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      tokens: {
        accessToken,
        refreshToken,
      },
    })
  }

  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any

      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      })

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw ApiError.unauthorized('Invalid refresh token')
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(
        storedToken.userId
      )

      // Delete old refresh token
      await prisma.refreshToken.delete({
        where: { token: refreshToken },
      })

      res.json({
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      })
    } catch (error) {
      logSecurity('Invalid refresh token', undefined, req.ip)
      throw ApiError.unauthorized('Invalid refresh token')
    }
  }

  async logout(req: AuthenticatedRequest, res: Response) {
    const { refreshToken } = req.body

    if (refreshToken) {
      // Delete specific refresh token
      await prisma.refreshToken.deleteMany({
        where: {
          token: refreshToken,
          userId: req.user!.id,
        },
      })
    }

    logger.info(`User logged out: ${req.user!.email}`)

    res.json({ message: 'Logout successful' })
  }

  async logoutAll(req: AuthenticatedRequest, res: Response) {
    // Delete all refresh tokens for user
    await prisma.refreshToken.deleteMany({
      where: { userId: req.user!.id },
    })

    logger.info(`User logged out from all devices: ${req.user!.email}`)

    res.json({ message: 'Logged out from all devices' })
  }

  async verifyEmail(req: Request, res: Response) {
    const { token } = req.body

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any

      if (decoded.type !== 'email_verification') {
        throw ApiError.badRequest('Invalid verification token')
      }

      // Update user verification status
      const user = await prisma.user.update({
        where: { id: decoded.userId },
        data: { 
          isVerified: true,
          emailVerified: new Date(),
        },
        select: {
          id: true,
          email: true,
          isVerified: true,
        },
      })

      logger.info(`Email verified: ${user.email}`)

      res.json({
        message: 'Email verified successfully',
        user,
      })
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw ApiError.badRequest('Invalid verification token')
      }
      throw error
    }
  }

  async resendVerification(req: Request, res: Response) {
    const { email } = req.body

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, isVerified: true },
    })

    if (!user) {
      throw ApiError.notFound('User not found')
    }

    if (user.isVerified) {
      throw ApiError.badRequest('Email already verified')
    }

    // Generate new verification token
    const verificationToken = jwt.sign(
      { userId: user.id, type: 'email_verification' },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Send verification email
    await emailService.sendVerificationEmail(email, verificationToken)

    res.json({ message: 'Verification email sent' })
  }

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    })

    if (!user) {
      // Don't reveal if email exists
      res.json({ message: 'If the email exists, a reset link has been sent' })
      return
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    // Send reset email
    await emailService.sendPasswordResetEmail(email, resetToken)

    res.json({ message: 'If the email exists, a reset link has been sent' })
  }

  async resetPassword(req: Request, res: Response) {
    const { token, password } = req.body

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any

      if (decoded.type !== 'password_reset') {
        throw ApiError.badRequest('Invalid reset token')
      }

      // Hash new password
      const hashedPassword = await argon2.hash(password)

      // Update password
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword },
      })

      // Delete all refresh tokens for security
      await prisma.refreshToken.deleteMany({
        where: { userId: decoded.userId },
      })

      logger.info(`Password reset: ${decoded.userId}`)

      res.json({ message: 'Password reset successfully' })
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw ApiError.badRequest('Invalid reset token')
      }
      throw error
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response) {
    const { currentPassword, newPassword } = req.body

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { password: true },
    })

    if (!user || !user.password) {
      throw ApiError.badRequest('Current password is required')
    }

    // Verify current password
    const isValidPassword = await argon2.verify(user.password, currentPassword)
    if (!isValidPassword) {
      throw ApiError.badRequest('Current password is incorrect')
    }

    // Hash new password
    const hashedPassword = await argon2.hash(newPassword)

    // Update password
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword },
    })

    logger.info(`Password changed: ${req.user!.id}`)

    res.json({ message: 'Password changed successfully' })
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response) {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        phone: true,
        phoneVerified: true,
        location: true,
        bio: true,
        isVerified: true,
        isPremium: true,
        role: true,
        subscriptionType: true,
        subscriptionExpiresAt: true,
        settings: true,
        socialLinks: true,
        rating: true,
        totalRatings: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw ApiError.notFound('User not found')
    }

    res.json({ user })
  }

  async updateProfile(req: AuthenticatedRequest, res: Response) {
    const { fullName, phone, location, bio, settings, socialLinks } = req.body

    // Check if phone is already taken by another user
    if (phone) {
      const existingUser = await prisma.user.findFirst({
        where: {
          phone,
          id: { not: req.user!.id },
        },
      })

      if (existingUser) {
        throw ApiError.conflict('Phone number already in use')
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        fullName,
        phone,
        location,
        bio,
        settings,
        socialLinks,
        ...(phone && { phoneVerified: null }), // Reset phone verification if phone changed
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        phoneVerified: true,
        location: true,
        bio: true,
        settings: true,
        socialLinks: true,
        updatedAt: true,
      },
    })

    res.json({
      message: 'Profile updated successfully',
      user,
    })
  }

  async verifyPhone(req: AuthenticatedRequest, res: Response) {
    const { phone } = req.body

    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Store code in cache for 5 minutes
    await cacheService.set(`phone_verification:${req.user!.id}`, {
      phone,
      code,
      attempts: 0,
    }, 300)

    // Send SMS
    await smsService.sendVerificationCode(phone, code)

    res.json({ message: 'Verification code sent to your phone' })
  }

  async confirmPhone(req: AuthenticatedRequest, res: Response) {
    const { code } = req.body

    const verification = await cacheService.get<{
      phone: string
      code: string
      attempts: number
    }>(`phone_verification:${req.user!.id}`)

    if (!verification) {
      throw ApiError.badRequest('Verification code expired or not found')
    }

    if (verification.attempts >= 3) {
      await cacheService.del(`phone_verification:${req.user!.id}`)
      throw ApiError.badRequest('Too many attempts. Please request a new code.')
    }

    if (verification.code !== code) {
      // Increment attempts
      await cacheService.set(`phone_verification:${req.user!.id}`, {
        ...verification,
        attempts: verification.attempts + 1,
      }, 300)
      
      throw ApiError.badRequest('Invalid verification code')
    }

    // Update user phone verification
    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        phone: verification.phone,
        phoneVerified: new Date(),
      },
    })

    // Clear verification data
    await cacheService.del(`phone_verification:${req.user!.id}`)

    res.json({ message: 'Phone number verified successfully' })
  }

  async deleteAccount(req: AuthenticatedRequest, res: Response) {
    const { password } = req.body

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { password: true, email: true },
    })

    if (!user || !user.password) {
      throw ApiError.badRequest('Password verification required')
    }

    // Verify password
    const isValidPassword = await argon2.verify(user.password, password)
    if (!isValidPassword) {
      throw ApiError.badRequest('Incorrect password')
    }

    // Soft delete user (mark as deleted but keep data for legal reasons)
    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        email: `deleted_${Date.now()}_${user.email}`,
        password: null,
        deletedAt: new Date(),
      },
    })

    // Delete all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId: req.user!.id },
    })

    logger.info(`Account deleted: ${user.email}`)

    res.json({ message: 'Account deleted successfully' })
  }

  private async generateTokens(userId: string) {
    // Generate access token
    const accessToken = jwt.sign(
      { userId },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    )

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    )

    // Store refresh token in database
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    })

    return { accessToken, refreshToken }
  }
}

export const authController = new AuthController()