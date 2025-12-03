import { Server as SocketIOServer } from 'socket.io'
import jwt from 'jsonwebtoken'
import { prisma } from './database'
import { getEnv } from './env'
import { logger, logSecurity } from '@/utils/logger'

const env = getEnv()

interface AuthenticatedSocket extends Socket {
  userId?: string
  userEmail?: string
}

export function setupSocketIO(io: SocketIOServer) {
  // Authentication middleware
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return next(new Error('Authentication token required'))
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as any
      
      if (!decoded.userId) {
        return next(new Error('Invalid token format'))
      }

      // Verify user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          isVerified: true,
        },
      })

      if (!user) {
        logSecurity('Invalid socket connection attempt', decoded.userId, socket.handshake.address)
        return next(new Error('User not found'))
      }

      socket.userId = user.id
      socket.userEmail = user.email
      
      next()
    } catch (error) {
      logSecurity('Socket authentication failed', undefined, socket.handshake.address, { error: error.message })
      next(new Error('Authentication failed'))
    }
  })

  // Connection handling
  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User connected: ${socket.userEmail} (${socket.userId})`)

    // Join user to their personal room
    socket.join(`user:${socket.userId}`)

    // Update user's online status
    updateUserOnlineStatus(socket.userId!, true)

    // Handle joining conversation rooms
    socket.on('join_conversation', async (conversationId: string) => {
      try {
        // Verify user is part of this conversation
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            OR: [
              { buyerId: socket.userId },
              { sellerId: socket.userId },
            ],
          },
        })

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found or access denied' })
          return
        }

        socket.join(`conversation:${conversationId}`)
        logger.info(`User ${socket.userId} joined conversation ${conversationId}`)
      } catch (error) {
        logger.error('Error joining conversation:', error)
        socket.emit('error', { message: 'Failed to join conversation' })
      }
    })

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`)
      logger.info(`User ${socket.userId} left conversation ${conversationId}`)
    })

    // Handle sending messages
    socket.on('send_message', async (data: {
      conversationId: string
      content: string
      messageType?: string
      attachments?: any[]
    }) => {
      try {
        const { conversationId, content, messageType = 'TEXT', attachments } = data

        // Verify conversation access
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            OR: [
              { buyerId: socket.userId },
              { sellerId: socket.userId },
            ],
          },
          include: {
            ad: {
              select: { id: true, title: true, userId: true },
            },
          },
        })

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' })
          return
        }

        // Determine receiver
        const receiverId = conversation.buyerId === socket.userId 
          ? conversation.sellerId 
          : conversation.buyerId

        // Create message
        const message = await prisma.message.create({
          data: {
            conversationId,
            adId: conversation.adId,
            senderId: socket.userId!,
            receiverId,
            content,
            messageType: messageType as any,
            attachments,
          },
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        })

        // Update conversation
        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            lastMessageId: message.id,
            lastMessageAt: message.createdAt,
            unreadCountBuyer: conversation.buyerId === receiverId 
              ? { increment: 1 } 
              : conversation.unreadCountBuyer,
            unreadCountSeller: conversation.sellerId === receiverId 
              ? { increment: 1 } 
              : conversation.unreadCountSeller,
          },
        })

        // Emit message to conversation room
        io.to(`conversation:${conversationId}`).emit('new_message', {
          message,
          conversationId,
        })

        // Send notification to receiver if they're online
        io.to(`user:${receiverId}`).emit('message_notification', {
          conversationId,
          message: {
            id: message.id,
            content: message.content,
            sender: message.sender,
            createdAt: message.createdAt,
          },
          ad: {
            id: conversation.ad.id,
            title: conversation.ad.title,
          },
        })

        logger.info(`Message sent from ${socket.userId} to ${receiverId} in conversation ${conversationId}`)
      } catch (error) {
        logger.error('Error sending message:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // Handle marking messages as read
    socket.on('mark_messages_read', async (data: {
      conversationId: string
      messageIds?: string[]
    }) => {
      try {
        const { conversationId, messageIds } = data

        // Verify conversation access
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            OR: [
              { buyerId: socket.userId },
              { sellerId: socket.userId },
            ],
          },
        })

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' })
          return
        }

        // Mark messages as read
        const whereClause: any = {
          conversationId,
          receiverId: socket.userId,
          isRead: false,
        }

        if (messageIds && messageIds.length > 0) {
          whereClause.id = { in: messageIds }
        }

        await prisma.message.updateMany({
          where: whereClause,
          data: {
            isRead: true,
            readAt: new Date(),
          },
        })

        // Update conversation unread count
        const updateData: any = {}
        if (conversation.buyerId === socket.userId) {
          updateData.unreadCountBuyer = 0
        } else {
          updateData.unreadCountSeller = 0
        }

        await prisma.conversation.update({
          where: { id: conversationId },
          data: updateData,
        })

        // Notify conversation participants
        io.to(`conversation:${conversationId}`).emit('messages_read', {
          conversationId,
          readBy: socket.userId,
          messageIds,
        })

        logger.info(`Messages marked as read by ${socket.userId} in conversation ${conversationId}`)
      } catch (error) {
        logger.error('Error marking messages as read:', error)
        socket.emit('error', { message: 'Failed to mark messages as read' })
      }
    })

    // Handle typing indicators
    socket.on('typing_start', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
        userId: socket.userId,
        conversationId: data.conversationId,
      })
    })

    socket.on('typing_stop', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        conversationId: data.conversationId,
      })
    })

    // Handle user presence
    socket.on('update_presence', (data: { status: 'online' | 'away' | 'busy' }) => {
      // Update user presence in cache or database
      socket.broadcast.emit('user_presence_updated', {
        userId: socket.userId,
        status: data.status,
      })
    })

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected: ${socket.userEmail} (${socket.userId}) - Reason: ${reason}`)
      
      // Update user's online status
      updateUserOnlineStatus(socket.userId!, false)
      
      // Notify others about user going offline
      socket.broadcast.emit('user_presence_updated', {
        userId: socket.userId,
        status: 'offline',
      })
    })

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${socket.userId}:`, error)
    })
  })

  // Handle server-side events
  io.engine.on('connection_error', (err) => {
    logger.error('Socket.IO connection error:', err)
  })

  logger.info('✅ Socket.IO server configured')
}

// Helper function to update user online status
async function updateUserOnlineStatus(userId: string, isOnline: boolean) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastSeenAt: new Date(),
        // You can add an 'isOnline' field to the user model if needed
      },
    })
  } catch (error) {
    logger.error('Error updating user online status:', error)
  }
}

// Utility functions for sending notifications
export class SocketNotificationService {
  constructor(private io: SocketIOServer) {}

  // Send notification to specific user
  async sendToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data)
  }

  // Send notification to conversation participants
  async sendToConversation(conversationId: string, event: string, data: any) {
    this.io.to(`conversation:${conversationId}`).emit(event, data)
  }

  // Broadcast to all connected users
  async broadcast(event: string, data: any) {
    this.io.emit(event, data)
  }

  // Send ad update notification
  async sendAdUpdate(adId: string, event: string, data: any) {
    this.io.emit(`ad_update:${adId}`, { event, data })
  }

  // Send system notification
  async sendSystemNotification(data: {
    title: string
    message: string
    type: 'info' | 'warning' | 'error' | 'success'
    targetUsers?: string[]
  }) {
    if (data.targetUsers) {
      data.targetUsers.forEach(userId => {
        this.sendToUser(userId, 'system_notification', data)
      })
    } else {
      this.broadcast('system_notification', data)
    }
  }
}