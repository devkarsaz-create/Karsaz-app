import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import dotenv from 'dotenv'

import { logger } from '@/utils/logger'
import { errorHandler } from '@/middleware/error-handler'
import { requestLogger } from '@/middleware/request-logger'
import { authMiddleware } from '@/middleware/auth'
import { validateEnv } from '@/config/env'
import { connectDatabase } from '@/config/database'
import { connectRedis } from '@/config/redis'
import { setupSocketIO } from '@/config/socket'

// Routes
import authRoutes from '@/routes/auth'
import userRoutes from '@/routes/users'
import categoryRoutes from '@/routes/categories'
import adRoutes from '@/routes/ads'
import searchRoutes from '@/routes/search'
import messageRoutes from '@/routes/messages'
import uploadRoutes from '@/routes/uploads'
import adminRoutes from '@/routes/admin'

// Load environment variables
dotenv.config()

// Validate environment variables
validateEnv()

const app = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:12000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:12000',
    process.env.ADMIN_URL || 'http://localhost:12001',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Compression
app.use(compression())

// Request logging
app.use(requestLogger)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', authMiddleware, userRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/ads', adRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/messages', authMiddleware, messageRoutes)
app.use('/api/uploads', authMiddleware, uploadRoutes)
app.use('/api/admin', authMiddleware, adminRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  })
})

// Error handling middleware
app.use(errorHandler)

// Setup Socket.IO
setupSocketIO(io)

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase()
    logger.info('Database connected successfully')

    // Connect to Redis
    await connectRedis()
    logger.info('Redis connected successfully')

    // Start server
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${PORT}`)
      logger.info(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:12000'}`)
      logger.info(`⚡ Admin URL: ${process.env.ADMIN_URL || 'http://localhost:12001'}`)
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export { app, server, io }