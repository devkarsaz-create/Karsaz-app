import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database'
import { ApiError } from '../utils/api-error'

const categoryQuerySchema = z.object({
  includeInactive: z.string().transform(Boolean).default('false'),
  parentId: z.string().optional(),
})

export class CategoryController {
  // Get all categories with hierarchy
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const query = categoryQuerySchema.parse(req.query)

      const where: any = {
        ...(query.parentId ? { parentId: query.parentId } : { parentId: null }),
        ...(query.includeInactive ? {} : { isActive: true })
      }

      const categories = await prisma.category.findMany({
        where,
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ],
        include: {
          children: {
            where: {
              isActive: true
            },
            orderBy: [
              { sortOrder: 'asc' },
              { name: 'asc' }
            ],
            include: {
              _count: {
                select: {
                  ads: {
                    where: {
                      status: 'ACTIVE',
                      deletedAt: null
                    }
                  }
                }
              }
            }
          },
          _count: {
            select: {
              ads: {
                where: {
                  status: 'ACTIVE',
                  deletedAt: null
                }
              }
            }
          }
        }
      })

      res.json({
        data: categories
      })

    } catch (error) {
      next(error)
    }
  }

  // Get single category with details
  static async getCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          children: {
            where: {
              isActive: true
            },
            orderBy: [
              { sortOrder: 'asc' },
              { name: 'asc' }
            ],
            include: {
              _count: {
                select: {
                  ads: {
                    where: {
                      status: 'ACTIVE',
                      deletedAt: null
                    }
                  }
                }
              }
            }
          },
          _count: {
            select: {
              ads: {
                where: {
                  status: 'ACTIVE',
                  deletedAt: null
                }
              }
            }
          }
        }
      })

      if (!category) {
        throw new ApiError(404, 'دسته‌بندی یافت نشد')
      }

      // Get recent ads in this category
      const recentAds = await prisma.ad.findMany({
        where: {
          categoryId: id,
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
          _count: {
            select: {
              favorites: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 12
      })

      res.json({
        data: {
          ...category,
          recentAds
        }
      })

    } catch (error) {
      next(error)
    }
  }

  // Get category by slug
  static async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params

      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          children: {
            where: {
              isActive: true
            },
            orderBy: [
              { sortOrder: 'asc' },
              { name: 'asc' }
            ],
            include: {
              _count: {
                select: {
                  ads: {
                    where: {
                      status: 'ACTIVE',
                      deletedAt: null
                    }
                  }
                }
              }
            }
          },
          _count: {
            select: {
              ads: {
                where: {
                  status: 'ACTIVE',
                  deletedAt: null
                }
              }
            }
          }
        }
      })

      if (!category) {
        throw new ApiError(404, 'دسته‌بندی یافت نشد')
      }

      res.json({
        data: category
      })

    } catch (error) {
      next(error)
    }
  }

  // Get popular categories
  static async getPopularCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.category.findMany({
        where: {
          isActive: true,
          parentId: null, // Only top-level categories
        },
        include: {
          _count: {
            select: {
              ads: {
                where: {
                  status: 'ACTIVE',
                  deletedAt: null,
                  createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                  }
                }
              }
            }
          }
        },
        orderBy: {
          ads: {
            _count: 'desc'
          }
        },
        take: 8
      })

      res.json({
        data: categories
      })

    } catch (error) {
      next(error)
    }
  }

  // Search categories
  static async searchCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query

      if (!q || typeof q !== 'string' || q.length < 2) {
        return res.json({ data: [] })
      }

      const categories = await prisma.category.findMany({
        where: {
          isActive: true,
          OR: [
            {
              name: {
                contains: q,
                mode: 'insensitive'
              }
            },
            {
              description: {
                contains: q,
                mode: 'insensitive'
              }
            }
          ]
        },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          _count: {
            select: {
              ads: {
                where: {
                  status: 'ACTIVE',
                  deletedAt: null
                }
              }
            }
          }
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ],
        take: 20
      })

      res.json({
        data: categories
      })

    } catch (error) {
      next(error)
    }
  }
}