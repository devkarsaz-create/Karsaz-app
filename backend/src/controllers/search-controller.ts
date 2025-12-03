import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database'
import { ApiError } from '../utils/api-error'

const searchQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  priceMin: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  priceMax: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']).optional(),
  sortBy: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'popular', 'relevance']).default('relevance'),
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('20'),
})

const suggestionsQuerySchema = z.object({
  q: z.string().min(2, 'حداقل 2 کاراکتر وارد کنید'),
})

export class SearchController {
  // Advanced search with filters
  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = searchQuerySchema.parse(req.query)

      const where: any = {
        status: 'ACTIVE',
        deletedAt: null,
      }

      // Text search
      if (query.q) {
        where.OR = [
          {
            title: {
              contains: query.q,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: query.q,
              mode: 'insensitive'
            }
          },
          {
            tags: {
              has: query.q
            }
          }
        ]
      }

      // Category filter
      if (query.category) {
        // Include subcategories
        const category = await prisma.category.findUnique({
          where: { id: query.category },
          include: {
            children: {
              select: { id: true }
            }
          }
        })

        if (category) {
          const categoryIds = [category.id, ...category.children.map(c => c.id)]
          where.categoryId = { in: categoryIds }
        }
      }

      // Location filter
      if (query.location) {
        where.location = {
          contains: query.location,
          mode: 'insensitive'
        }
      }

      // Price range filter
      if (query.priceMin || query.priceMax) {
        where.price = {}
        if (query.priceMin) where.price.gte = query.priceMin
        if (query.priceMax) where.price.lte = query.priceMax
      }

      // Condition filter
      if (query.condition) {
        where.condition = query.condition
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
        case 'relevance':
          // For text search, we'll use a simple relevance scoring
          if (query.q) {
            orderBy = [
              { isPremium: 'desc' },
              { createdAt: 'desc' }
            ]
          } else {
            orderBy = { createdAt: 'desc' }
          }
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

      // Get search filters for faceted search
      const filters = await this.getSearchFilters(where, query.q)

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
        },
        filters,
        query: {
          searchTerm: query.q,
          appliedFilters: {
            category: query.category,
            location: query.location,
            priceRange: query.priceMin || query.priceMax ? {
              min: query.priceMin,
              max: query.priceMax
            } : null,
            condition: query.condition,
          }
        }
      })

    } catch (error) {
      next(error)
    }
  }

  // Get search suggestions
  static async getSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = suggestionsQuerySchema.parse(req.query)

      // Get title suggestions
      const titleSuggestions = await prisma.ad.findMany({
        where: {
          status: 'ACTIVE',
          deletedAt: null,
          title: {
            contains: q,
            mode: 'insensitive'
          }
        },
        select: {
          title: true
        },
        distinct: ['title'],
        take: 5,
        orderBy: {
          viewCount: 'desc'
        }
      })

      // Get category suggestions
      const categorySuggestions = await prisma.category.findMany({
        where: {
          isActive: true,
          name: {
            contains: q,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: 5,
        orderBy: {
          name: 'asc'
        }
      })

      // Get location suggestions
      const locationSuggestions = await prisma.ad.findMany({
        where: {
          status: 'ACTIVE',
          deletedAt: null,
          location: {
            contains: q,
            mode: 'insensitive'
          }
        },
        select: {
          location: true
        },
        distinct: ['location'],
        take: 5
      })

      // Get popular search terms (you might want to implement a search_logs table for this)
      const suggestions = titleSuggestions.map(ad => ad.title)

      res.json({
        data: {
          suggestions,
          categories: categorySuggestions,
          locations: locationSuggestions.map(ad => ad.location).filter(Boolean),
        }
      })

    } catch (error) {
      next(error)
    }
  }

  // Get trending searches
  static async getTrendingSearches(req: Request, res: Response, next: NextFunction) {
    try {
      // Get most searched categories (based on ad count in last 30 days)
      const trendingCategories = await prisma.category.findMany({
        where: {
          isActive: true,
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
        take: 10
      })

      // Get popular locations
      const popularLocations = await prisma.ad.groupBy({
        by: ['location'],
        where: {
          status: 'ACTIVE',
          deletedAt: null,
          location: {
            not: null
          },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        _count: {
          location: true
        },
        orderBy: {
          _count: {
            location: 'desc'
          }
        },
        take: 10
      })

      // Get trending keywords from tags
      const trendingTags = await prisma.ad.findMany({
        where: {
          status: 'ACTIVE',
          deletedAt: null,
          tags: {
            not: []
          },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        select: {
          tags: true
        }
      })

      // Flatten and count tags
      const tagCounts: { [key: string]: number } = {}
      trendingTags.forEach(ad => {
        ad.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      })

      const sortedTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tag]) => tag)

      res.json({
        data: {
          categories: trendingCategories.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            adsCount: cat._count.ads
          })),
          locations: popularLocations.map(loc => ({
            name: loc.location,
            count: loc._count.location
          })),
          keywords: sortedTags
        }
      })

    } catch (error) {
      next(error)
    }
  }

  // Get search filters for faceted search
  private static async getSearchFilters(baseWhere: any, searchTerm?: string) {
    try {
      // Get available categories with counts
      const categories = await prisma.category.findMany({
        where: {
          isActive: true,
          ads: {
            some: baseWhere
          }
        },
        include: {
          _count: {
            select: {
              ads: {
                where: baseWhere
              }
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })

      // Get available locations with counts
      const locations = await prisma.ad.groupBy({
        by: ['location'],
        where: {
          ...baseWhere,
          location: {
            not: null
          }
        },
        _count: {
          location: true
        },
        orderBy: {
          _count: {
            location: 'desc'
          }
        },
        take: 20
      })

      // Get price ranges
      const priceStats = await prisma.ad.aggregate({
        where: {
          ...baseWhere,
          price: {
            not: null
          }
        },
        _min: {
          price: true
        },
        _max: {
          price: true
        },
        _avg: {
          price: true
        }
      })

      // Generate price ranges
      const priceRanges = []
      if (priceStats._min.price && priceStats._max.price) {
        const min = Number(priceStats._min.price)
        const max = Number(priceStats._max.price)
        const ranges = [
          { min: 0, max: 1000000 },
          { min: 1000000, max: 5000000 },
          { min: 5000000, max: 10000000 },
          { min: 10000000, max: 50000000 },
          { min: 50000000, max: null }
        ]

        for (const range of ranges) {
          const count = await prisma.ad.count({
            where: {
              ...baseWhere,
              price: {
                gte: range.min,
                ...(range.max && { lte: range.max })
              }
            }
          })

          if (count > 0) {
            priceRanges.push({
              ...range,
              count
            })
          }
        }
      }

      // Get condition counts
      const conditions = await prisma.ad.groupBy({
        by: ['condition'],
        where: baseWhere,
        _count: {
          condition: true
        },
        orderBy: {
          _count: {
            condition: 'desc'
          }
        }
      })

      return {
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          count: cat._count.ads
        })),
        locations: locations.map(loc => ({
          name: loc.location,
          count: loc._count.location
        })),
        priceRanges,
        conditions: conditions.map(cond => ({
          value: cond.condition,
          count: cond._count.condition
        })),
        priceStats: {
          min: priceStats._min.price ? Number(priceStats._min.price) : 0,
          max: priceStats._max.price ? Number(priceStats._max.price) : 0,
          avg: priceStats._avg.price ? Number(priceStats._avg.price) : 0,
        }
      }
    } catch (error) {
      return {
        categories: [],
        locations: [],
        priceRanges: [],
        conditions: [],
        priceStats: { min: 0, max: 0, avg: 0 }
      }
    }
  }

  // Save search query (for analytics)
  static async saveSearchQuery(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, resultsCount, filters } = req.body

      // You might want to implement a search_logs table for this
      // For now, we'll just log it
      console.log('Search query:', {
        query,
        resultsCount,
        filters,
        timestamp: new Date(),
        userAgent: req.get('User-Agent'),
        ip: req.ip
      })

      res.json({ message: 'Search logged' })

    } catch (error) {
      next(error)
    }
  }
}