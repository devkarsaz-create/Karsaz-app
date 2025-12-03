import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database'
import { AuthenticatedRequest } from '../middleware/auth'
import { ApiError } from '../utils/api-error'
import { logger } from '../utils/logger'

// Validation schemas
const createAdSchema = z.object({
  title: z.string().min(10, 'عنوان باید حداقل 10 کاراکتر باشد').max(200, 'عنوان نباید بیش از 200 کاراکتر باشد'),
  description: z.string().min(50, 'توضیحات باید حداقل 50 کاراکتر باشد').max(5000, 'توضیحات نباید بیش از 5000 کاراکتر باشد'),
  price: z.number().positive('قیمت باید مثبت باشد').optional(),
  categoryId: z.string().min(1, 'دسته‌بندی الزامی است'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  images: z.array(z.string()).max(10, 'حداکثر 10 تصویر مجاز است'),
  tags: z.array(z.string()).max(10, 'حداکثر 10 تگ مجاز است').optional(),
  specifications: z.record(z.any()).optional(),
  contactInfo: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    whatsapp: z.string().optional(),
  }).optional(),
  deliveryOptions: z.array(z.string()).optional(),
  paymentMethods: z.array(z.string()).optional(),
  negotiable: z.boolean().default(true),
  urgent: z.boolean().default(false),
})

const updateAdSchema = createAdSchema.partial()

const adsQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('20'),
  category: z.string().optional(),
  location: z.string().optional(),
  priceMin: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  priceMax: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']).optional(),
  sortBy: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'popular']).default('newest'),
  search: z.string().optional(),
  userId: z.string().optional(),
  status: z.enum(['ACTIVE', 'SOLD', 'EXPIRED']).optional(),
})

export class AdController {
  // Get all ads with filters and pagination
  static async getAds(req: Request, res: Response, next: NextFunction) {
    try {
      const query = adsQuerySchema.parse(req.query)
      
      const where: any = {
        status: query.status || 'ACTIVE',
        deletedAt: null,
      }

      // Apply filters
      if (query.category) {
        where.categoryId = query.category
      }

      if (query.location) {
        where.location = {
          contains: query.location,
          mode: 'insensitive'
        }
      }

      if (query.priceMin || query.priceMax) {
        where.price = {}
        if (query.priceMin) where.price.gte = query.priceMin
        if (query.priceMax) where.price.lte = query.priceMax
      }

      if (query.condition) {
        where.condition = query.condition
      }

      if (query.search) {
        where.OR = [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
          { tags: { has: query.search } }
        ]
      }

      if (query.userId) {
        where.userId = query.userId
      }

      // Sorting
      let orderBy: any = { createdAt: 'desc' }
      switch (query.sortBy) {
        case 'oldest':
          orderBy = { createdAt: 'asc' }
          break
        case 'price_asc':
          orderBy = { price: 'asc' }
          break
        case 'price_desc':
          orderBy = { price: 'desc' }
          break
        case 'popular':
          orderBy = { viewCount: 'desc' }
          break
      }

      const skip = (query.page - 1) * query.limit

      const [ads, total] = await Promise.all([
        prisma.ad.findMany({
          where,
          orderBy,
          skip,
          take: query.limit,
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
        }),
        prisma.ad.count({ where })
      ])

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

  // Get single ad by ID
  static async getAd(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      const ad = await prisma.ad.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              rating: true,
              totalRatings: true,
              lastSeenAt: true,
              createdAt: true,
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              icon: true,
              parent: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                }
              }
            }
          },
          reviews: {
            include: {
              reviewer: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: {
              favorites: true,
              reviews: true,
            }
          }
        }
      })

      if (!ad) {
        throw new ApiError(404, 'آگهی یافت نشد')
      }

      // Get related ads
      const relatedAds = await prisma.ad.findMany({
        where: {
          categoryId: ad.categoryId,
          id: { not: ad.id },
          status: 'ACTIVE',
          deletedAt: null,
        },
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
          }
        },
        take: 6,
        orderBy: { createdAt: 'desc' }
      })

      res.json({
        data: {
          ...ad,
          relatedAds
        }
      })

    } catch (error) {
      next(error)
    }
  }

  // Create new ad
  static async createAd(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = createAdSchema.parse(req.body)
      const userId = req.user!.id

      // Verify category exists
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId }
      })

      if (!category) {
        throw new ApiError(400, 'دسته‌بندی معتبر نیست')
      }

      const ad = await prisma.ad.create({
        data: {
          ...data,
          userId,
          price: data.price ? data.price : null,
          tags: data.tags || [],
          specifications: data.specifications || {},
          contactInfo: data.contactInfo || {},
          deliveryOptions: data.deliveryOptions || [],
          paymentMethods: data.paymentMethods || [],
        },
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
          }
        }
      })

      logger.info('Ad created', { adId: ad.id, userId })

      res.status(201).json({
        message: 'آگهی با موفقیت ایجاد شد',
        data: ad
      })

    } catch (error) {
      next(error)
    }
  }

  // Update ad
  static async updateAd(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const data = updateAdSchema.parse(req.body)
      const userId = req.user!.id

      // Check if ad exists and belongs to user
      const existingAd = await prisma.ad.findFirst({
        where: {
          id,
          userId,
          deletedAt: null,
        }
      })

      if (!existingAd) {
        throw new ApiError(404, 'آگهی یافت نشد یا شما مجاز به ویرایش آن نیستید')
      }

      // Verify category if provided
      if (data.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: data.categoryId }
        })

        if (!category) {
          throw new ApiError(400, 'دسته‌بندی معتبر نیست')
        }
      }

      const ad = await prisma.ad.update({
        where: { id },
        data: {
          ...data,
          price: data.price !== undefined ? data.price : existingAd.price,
          updatedAt: new Date(),
        },
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
          }
        }
      })

      logger.info('Ad updated', { adId: ad.id, userId })

      res.json({
        message: 'آگهی با موفقیت بروزرسانی شد',
        data: ad
      })

    } catch (error) {
      next(error)
    }
  }

  // Delete ad
  static async deleteAd(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const userId = req.user!.id

      // Check if ad exists and belongs to user
      const existingAd = await prisma.ad.findFirst({
        where: {
          id,
          userId,
          deletedAt: null,
        }
      })

      if (!existingAd) {
        throw new ApiError(404, 'آگهی یافت نشد یا شما مجاز به حذف آن نیستید')
      }

      // Soft delete
      await prisma.ad.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: 'DELETED',
        }
      })

      logger.info('Ad deleted', { adId: id, userId })

      res.json({
        message: 'آگهی با موفقیت حذف شد'
      })

    } catch (error) {
      next(error)
    }
  }

  // Increment view count
  static async incrementView(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      const ad = await prisma.ad.findFirst({
        where: {
          id,
          status: 'ACTIVE',
          deletedAt: null,
        }
      })

      if (!ad) {
        throw new ApiError(404, 'آگهی یافت نشد')
      }

      const updatedAd = await prisma.ad.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1
          }
        }
      })

      res.json({
        message: 'بازدید ثبت شد',
        views: updatedAd.viewCount
      })

    } catch (error) {
      next(error)
    }
  }

  // Mark ad as sold
  static async markAsSold(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const userId = req.user!.id

      const ad = await prisma.ad.findFirst({
        where: {
          id,
          userId,
          deletedAt: null,
        }
      })

      if (!ad) {
        throw new ApiError(404, 'آگهی یافت نشد یا شما مجاز به تغییر آن نیستید')
      }

      const updatedAd = await prisma.ad.update({
        where: { id },
        data: {
          status: 'SOLD',
          updatedAt: new Date(),
        }
      })

      logger.info('Ad marked as sold', { adId: id, userId })

      res.json({
        message: 'آگهی به عنوان فروخته شده علامت‌گذاری شد',
        data: updatedAd
      })

    } catch (error) {
      next(error)
    }
  }

  // Get user's ads
  static async getUserAds(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const query = adsQuerySchema.parse(req.query)

      const where = {
        userId,
        deletedAt: null,
        ...(query.status && { status: query.status })
      }

      const skip = (query.page - 1) * query.limit

      const [ads, total] = await Promise.all([
        prisma.ad.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: query.limit,
          include: {
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
                messages: true,
              }
            }
          }
        }),
        prisma.ad.count({ where })
      ])

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
}