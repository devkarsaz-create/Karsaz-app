import Redis from 'ioredis'
import { getEnv } from './env'
import { logger } from '@/utils/logger'

let redis: Redis

export async function connectRedis() {
  try {
    const env = getEnv()
    
    redis = new Redis(env.REDIS_URL, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
    })

    redis.on('connect', () => {
      logger.info('✅ Redis connected successfully')
    })

    redis.on('error', (error) => {
      logger.error('❌ Redis connection error:', error)
    })

    redis.on('ready', () => {
      logger.info('✅ Redis ready for commands')
    })

    redis.on('close', () => {
      logger.warn('⚠️ Redis connection closed')
    })

    await redis.connect()
    
    return redis
  } catch (error) {
    logger.error('❌ Redis connection failed:', error)
    throw error
  }
}

export function getRedis(): Redis {
  if (!redis) {
    throw new Error('Redis not initialized. Call connectRedis() first.')
  }
  return redis
}

export async function disconnectRedis() {
  if (redis) {
    await redis.disconnect()
    logger.info('✅ Redis disconnected successfully')
  }
}

// Cache utilities
export class CacheService {
  private redis: Redis

  constructor() {
    this.redis = getRedis()
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      logger.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value)
      if (ttl) {
        await this.redis.setex(key, ttl, serialized)
      } else {
        await this.redis.set(key, serialized)
      }
      return true
    } catch (error) {
      logger.error('Cache set error:', error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(key)
      return true
    } catch (error) {
      logger.error('Cache delete error:', error)
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      logger.error('Cache exists error:', error)
      return false
    }
  }

  async increment(key: string, ttl?: number): Promise<number> {
    try {
      const result = await this.redis.incr(key)
      if (ttl && result === 1) {
        await this.redis.expire(key, ttl)
      }
      return result
    } catch (error) {
      logger.error('Cache increment error:', error)
      return 0
    }
  }

  async setHash(key: string, field: string, value: any): Promise<boolean> {
    try {
      await this.redis.hset(key, field, JSON.stringify(value))
      return true
    } catch (error) {
      logger.error('Cache setHash error:', error)
      return false
    }
  }

  async getHash<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.redis.hget(key, field)
      return value ? JSON.parse(value) : null
    } catch (error) {
      logger.error('Cache getHash error:', error)
      return null
    }
  }

  async getAllHash<T>(key: string): Promise<Record<string, T>> {
    try {
      const hash = await this.redis.hgetall(key)
      const result: Record<string, T> = {}
      
      for (const [field, value] of Object.entries(hash)) {
        result[field] = JSON.parse(value)
      }
      
      return result
    } catch (error) {
      logger.error('Cache getAllHash error:', error)
      return {}
    }
  }

  async addToSet(key: string, value: string): Promise<boolean> {
    try {
      await this.redis.sadd(key, value)
      return true
    } catch (error) {
      logger.error('Cache addToSet error:', error)
      return false
    }
  }

  async removeFromSet(key: string, value: string): Promise<boolean> {
    try {
      await this.redis.srem(key, value)
      return true
    } catch (error) {
      logger.error('Cache removeFromSet error:', error)
      return false
    }
  }

  async isInSet(key: string, value: string): Promise<boolean> {
    try {
      const result = await this.redis.sismember(key, value)
      return result === 1
    } catch (error) {
      logger.error('Cache isInSet error:', error)
      return false
    }
  }

  async getSetMembers(key: string): Promise<string[]> {
    try {
      return await this.redis.smembers(key)
    } catch (error) {
      logger.error('Cache getSetMembers error:', error)
      return []
    }
  }

  async flushPattern(pattern: string): Promise<boolean> {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
      return true
    } catch (error) {
      logger.error('Cache flushPattern error:', error)
      return false
    }
  }
}

export const cacheService = new CacheService()