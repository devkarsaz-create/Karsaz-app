import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database'
import { AuthenticatedRequest } from '../middleware/auth'
import { ApiError } from '../utils/api-error'
import { logger } from '../utils/logger'

const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'نام باید حداقل 2 کاراکتر باشد').max(100, 'نام نباید بیش از 100 کاراکتر باشد').optional(),
  phone: z.string().regex(/^(\+98|0)?9\d{9}$/, 'شماره موبایل معتبر نیست').optional(),
  location: z.string().max(200, 'موقعیت نباید بیش از 200 کاراکتر باشد').optional(),
  bio: z.string().max(500, 'بیوگرافی نباید بیش از 500 کاراکتر باشد').optional(),
  avatarUrl: z.string().url('آدرس تصویر معتبر نیست').optional(),
  settings: z.record(z.any()).optional(),
  socialLinks: z.object({
    website: z.string().url().optional(),
    instagram: z.string().optional(),
    telegram: z.string().optional(),
    whatsapp: z.string().optional(),
  }).optional(),
})

const favoritesQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('20'),
  category: z.string().optional(),
  sortBy: z.enum(['newest', 'oldest', 'price_asc', 'price_desc']).default('newest'),
})

export class UserController {
  // Get user profile
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id

      const user = await prisma.user.findUnique({
        where: { id: userId },
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
          _count: {
            select: {
              ads: {
                where: {
                  deletedAt: null
                }
              },
              favorites: true,
              sentMessages: true,
            }
          }
        }
      })

      if (!user) {
        throw new ApiError(404, 'کاربر یافت نشد')
      }

      res.json({
        data: user
      })

    } catch (error) {
      next(error)
    }
  }

  // Update user profile
  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const data = updateProfileSchema.parse(req.body)

      // Check if phone number is already taken by another user
      if (data.phone) {
        const existingUser = await prisma.user.findFirst({
          where: {
            phone: data.phone,
            id: { not: userId }
          }
        })

        if (existingUser) {
          throw new ApiError(409, 'این شماره موبایل قبلاً ثبت شده است')
        }
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
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
        }
      })

      logger.info('User profile updated', { userId })

      res.json({
        message: 'پروفایل با موفقیت بروزرسانی شد',
        data: user
      })

    } catch (error) {
      next(error)
    }
  }

  // Delete user account
  static async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { password } = req.body

      if (!password) {
        throw new ApiError(400, 'رمز عبور برای حذف حساب الزامی است')
      }

      // Verify password
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true }
      })

      if (!user || !user.password) {
        throw new ApiError(404, 'کاربر یافت نشد')
      }

      const bcrypt = require('bcrypt')
      const isValidPassword = await bcrypt.compare(password, user.password)

      if (!isValidPassword) {
        throw new ApiError(400, 'رمز عبور اشتباه است')
      }

      // Soft delete user account
      await prisma.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          email: `deleted_${userId}@deleted.com`, // Prevent email conflicts
          phone: null,
        }
      })

      // Soft delete user's ads
      await prisma.ad.updateMany({
        where: { userId },
        data: {
          deletedAt: new Date(),
          status: 'DELETED',
        }
      })

      logger.info('User account deleted', { userId })

      res.json({
        message: 'حساب کاربری با موفقیت حذف شد'
      })

    } catch (error) {
      next(error)
    }
  }

  // Get user favorites
  static async getFavorites(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const query = favoritesQuerySchema.parse(req.query)

      const where: any = {
        userId,
        ad: {
          status: 'ACTIVE',
          deletedAt: null,
        }
      }

      if (query.category) {
        where.ad.categoryId = query.category
      }

      // Sorting
      let orderBy: any = { createdAt: 'desc' }
      switch (query.sortBy) {
        case 'oldest':
          orderBy = { createdAt: 'asc' }
          break
        case 'price_asc':
          orderBy = { ad: { price: 'asc' } }
          break
        case 'price_desc':
          orderBy = { ad: { price: 'desc' } }
          break
      }

      const skip = (query.page - 1) * query.limit

      const [favorites, total] = await Promise.all([
        prisma.favorite.findMany({
          where,
          orderBy,
          skip,
          take: query.limit,
          include: {
            ad: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    avatarUrl: true,
                    rating: true,
                    totalRatings: true,
                  }
                },
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    icon: true,
                  }
                },
                _count: {
                  select: {
                    favorites: true,
                    reviews: true,
                  }
                }
              }
            }
          }
        }),
        prisma.favorite.count({ where })
      ])

      const ads = favorites.map(fav => fav.ad)
      const totalPages = Math.ceil(total / query.limit)

      res.json({
        data: ads,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages,
          hasNext: query.page < totalPages,
          hasPrev: query.page > 1,
        }
      })

    } catch (error) {
      next(error)
    }
  }

  // Add to favorites
  static async addToFavorites(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { adId } = req.params

      // Check if ad exists and is active
      const ad = await prisma.ad.findFirst({
        where: {
          id: adId,
          status: 'ACTIVE',
          deletedAt: null,
        }
      })

      if (!ad) {
        throw new ApiError(404, 'آگهی یافت نشد')
      }

      // Check if already favorited
      const existingFavorite = await prisma.favorite.findUnique({
        where: {
          userId_adId: {
            userId,
            adId,
          }
        }
      })

      if (existingFavorite) {
        throw new ApiError(409, 'این آگهی قبلاً به علاقه‌مندی‌ها اضافه شده است')
      }

      const favorite = await prisma.favorite.create({
        data: {
          userId,
          adId,
        }
      })

      logger.info('Ad added to favorites', { userId, adId })

      res.status(201).json({
        message: 'آگهی به علاقه‌مندی‌ها اضافه شد',
        data: favorite
      })

    } catch (error) {
      next(error)
    }
  }

  // Remove from favorites
  static async removeFromFavorites(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { adId } = req.params

      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_adId: {
            userId,
            adId,
          }
        }
      })

      if (!favorite) {
        throw new ApiError(404, 'این آگهی در علاقه‌مندی‌های شما یافت نشد')
      }

      await prisma.favorite.delete({
        where: {
          userId_adId: {
            userId,
            adId,
          }
        }
      })

      logger.info('Ad removed from favorites', { userId, adId })

      res.json({
        message: 'آگهی از علاقه‌مندی‌ها حذف شد'
      })

    } catch (error) {
      next(error)
    }
  }

  // Get user statistics
  static async getUserStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id

      const [
        totalAds,
        activeAds,
        soldAds,
        totalViews,
        totalFavorites,
        totalMessages,
        recentActivity
      ] = await Promise.all([
        // Total ads
        prisma.ad.count({
          where: {
            userId,
            deletedAt: null,
          }
        }),
        // Active ads
        prisma.ad.count({
          where: {
            userId,
            status: 'ACTIVE',
            deletedAt: null,
          }
        }),
        // Sold ads
        prisma.ad.count({
          where: {
            userId,
            status: 'SOLD',
            deletedAt: null,
          }
        }),
        // Total views
        prisma.ad.aggregate({
          where: {
            userId,
            deletedAt: null,
          },
          _sum: {
            viewCount: true,
          }
        }),
        // Total favorites received
        prisma.favorite.count({
          where: {
            ad: {
              userId,
              deletedAt: null,
            }
          }
        }),
        // Total messages
        prisma.message.count({
          where: {
            OR: [
              { senderId: userId },
              { receiverId: userId }
            ],
            deletedAt: null,
          }
        }),
        // Recent activity (last 30 days)
        prisma.ad.count({
          where: {
            userId,
            deletedAt: null,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ])

      const stats = {
        ads: {
          total: totalAds,
          active: activeAds,
          sold: soldAds,
          recentlyCreated: recentActivity,
        },
        engagement: {
          totalViews: totalViews._sum.viewCount || 0,
          totalFavorites,
          totalMessages,
        },
        performance: {
          averageViewsPerAd: totalAds > 0 ? Math.round((totalViews._sum.viewCount || 0) / totalAds) : 0,
          conversionRate: totalAds > 0 ? Math.round((soldAds / totalAds) * 100) : 0,
        }
      }

      res.json({
        data: stats
      })

    } catch (error) {
      next(error)
    }
  }
}