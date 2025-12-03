import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database'
import { AuthenticatedRequest } from '../middleware/auth'
import { ApiError } from '../utils/api-error'
import { logger } from '../utils/logger'
import { io } from '../config/socket'

const sendMessageSchema = z.object({
  content: z.string().min(1, 'محتوای پیام نمی‌تواند خالی باشد').max(2000, 'پیام نباید بیش از 2000 کاراکتر باشد'),
  messageType: z.enum(['TEXT', 'IMAGE', 'DOCUMENT', 'LOCATION', 'CONTACT']).default('TEXT'),
  attachments: z.array(z.any()).optional(),
})

const messagesQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('50'),
  before: z.string().optional(), // Message ID for cursor-based pagination
})

const conversationsQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).default('20'),
})

const markReadSchema = z.object({
  messageIds: z.array(z.string()).optional(),
})

export class MessageController {
  // Get user's conversations
  static async getConversations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const query = conversationsQuerySchema.parse(req.query)

      const skip = (query.page - 1) * query.limit

      const [conversations, total] = await Promise.all([
        prisma.conversation.findMany({
          where: {
            OR: [
              { buyerId: userId },
              { sellerId: userId }
            ]
          },
          include: {
            ad: {
              select: {
                id: true,
                title: true,
                images: true,
                price: true,
                status: true,
              }
            },
            buyer: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                lastSeenAt: true,
              }
            },
            seller: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                lastSeenAt: true,
              }
            },
            lastMessage: {
              include: {
                sender: {
                  select: {
                    id: true,
                    fullName: true,
                  }
                }
              }
            }
          },
          orderBy: {
            lastMessageAt: 'desc'
          },
          skip,
          take: query.limit,
        }),
        prisma.conversation.count({
          where: {
            OR: [
              { buyerId: userId },
              { sellerId: userId }
            ]
          }
        })
      ])

      // Transform conversations to include other user info and unread count
      const transformedConversations = conversations.map(conv => {
        const isUserBuyer = conv.buyerId === userId
        const otherUser = isUserBuyer ? conv.seller : conv.buyer
        const unreadCount = isUserBuyer ? conv.unreadCountBuyer : conv.unreadCountSeller

        return {
          id: conv.id,
          adId: conv.adId,
          ad: conv.ad,
          buyerId: conv.buyerId,
          sellerId: conv.sellerId,
          otherUser,
          lastMessage: conv.lastMessage,
          unreadCount,
          lastMessageAt: conv.lastMessageAt,
          isBlockedByBuyer: conv.isBlockedByBuyer,
          isBlockedBySeller: conv.isBlockedBySeller,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        }
      })

      const totalPages = Math.ceil(total / query.limit)

      res.json({
        data: transformedConversations,
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

  // Get conversation details
  static async getConversation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const userId = req.user!.id

      const conversation = await prisma.conversation.findFirst({
        where: {
          id,
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        },
        include: {
          ad: {
            select: {
              id: true,
              title: true,
              images: true,
              price: true,
              status: true,
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                }
              }
            }
          },
          buyer: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              lastSeenAt: true,
            }
          },
          seller: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              lastSeenAt: true,
            }
          }
        }
      })

      if (!conversation) {
        throw new ApiError(404, 'مکالمه یافت نشد')
      }

      res.json({
        data: conversation
      })

    } catch (error) {
      next(error)
    }
  }

  // Get messages in a conversation
  static async getMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const userId = req.user!.id
      const query = messagesQuerySchema.parse(req.query)

      // Verify user has access to this conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          id,
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        }
      })

      if (!conversation) {
        throw new ApiError(404, 'مکالمه یافت نشد')
      }

      const where: any = {
        conversationId: id,
        deletedAt: null,
      }

      // Cursor-based pagination for better performance
      if (query.before) {
        where.id = { lt: query.before }
      }

      const messages = await prisma.message.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: query.limit,
      })

      // Reverse to show oldest first
      messages.reverse()

      res.json({
        data: messages,
        pagination: {
          hasMore: messages.length === query.limit,
          nextCursor: messages.length > 0 ? messages[0].id : null,
        }
      })

    } catch (error) {
      next(error)
    }
  }

  // Send a message
  static async sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params // conversation ID
      const userId = req.user!.id
      const data = sendMessageSchema.parse(req.body)

      // Verify user has access to this conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          id,
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        },
        include: {
          ad: {
            select: {
              id: true,
              title: true,
              status: true,
            }
          }
        }
      })

      if (!conversation) {
        throw new ApiError(404, 'مکالمه یافت نشد')
      }

      // Check if conversation is blocked
      const isUserBuyer = conversation.buyerId === userId
      const isBlocked = isUserBuyer ? conversation.isBlockedBySeller : conversation.isBlockedByBuyer

      if (isBlocked) {
        throw new ApiError(403, 'امکان ارسال پیام وجود ندارد')
      }

      const receiverId = isUserBuyer ? conversation.sellerId : conversation.buyerId

      // Create message
      const message = await prisma.message.create({
        data: {
          conversationId: id,
          adId: conversation.adId,
          senderId: userId,
          receiverId,
          content: data.content,
          messageType: data.messageType,
          attachments: data.attachments || [],
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            }
          },
          receiver: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            }
          }
        }
      })

      // Update conversation
      await prisma.conversation.update({
        where: { id },
        data: {
          lastMessageId: message.id,
          lastMessageAt: message.createdAt,
          ...(isUserBuyer 
            ? { unreadCountSeller: { increment: 1 } }
            : { unreadCountBuyer: { increment: 1 } }
          )
        }
      })

      // Emit real-time events
      io.to(`conversation:${id}`).emit('new_message', {
        message,
        conversationId: id
      })

      // Send notification to receiver
      io.to(`user:${receiverId}`).emit('message_notification', {
        conversationId: id,
        message: {
          id: message.id,
          content: message.content,
          sender: message.sender,
          createdAt: message.createdAt,
        },
        ad: conversation.ad
      })

      logger.info('Message sent', { 
        messageId: message.id, 
        conversationId: id, 
        senderId: userId,
        receiverId 
      })

      res.status(201).json({
        message: 'پیام ارسال شد',
        data: message
      })

    } catch (error) {
      next(error)
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params // conversation ID
      const userId = req.user!.id
      const data = markReadSchema.parse(req.body)

      // Verify user has access to this conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          id,
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        }
      })

      if (!conversation) {
        throw new ApiError(404, 'مکالمه یافت نشد')
      }

      const isUserBuyer = conversation.buyerId === userId

      // Build where clause for messages to mark as read
      const where: any = {
        conversationId: id,
        receiverId: userId,
        isRead: false,
      }

      if (data.messageIds && data.messageIds.length > 0) {
        where.id = { in: data.messageIds }
      }

      // Mark messages as read
      const updateResult = await prisma.message.updateMany({
        where,
        data: {
          isRead: true,
          readAt: new Date(),
        }
      })

      // Reset unread count for this user
      await prisma.conversation.update({
        where: { id },
        data: {
          ...(isUserBuyer 
            ? { unreadCountBuyer: 0 }
            : { unreadCountSeller: 0 }
          )
        }
      })

      // Emit real-time event
      io.to(`conversation:${id}`).emit('messages_read', {
        conversationId: id,
        readBy: userId,
        messageIds: data.messageIds
      })

      logger.info('Messages marked as read', { 
        conversationId: id, 
        userId,
        markedCount: updateResult.count 
      })

      res.json({
        message: 'پیام‌ها به عنوان خوانده شده علامت‌گذاری شدند',
        markedCount: updateResult.count
      })

    } catch (error) {
      next(error)
    }
  }

  // Start a new conversation
  static async startConversation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { adId } = req.body
      const buyerId = req.user!.id

      if (!adId) {
        throw new ApiError(400, 'شناسه آگهی الزامی است')
      }

      // Get ad details
      const ad = await prisma.ad.findFirst({
        where: {
          id: adId,
          status: 'ACTIVE',
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          userId: true,
        }
      })

      if (!ad) {
        throw new ApiError(404, 'آگهی یافت نشد')
      }

      const sellerId = ad.userId

      // Check if user is trying to message their own ad
      if (buyerId === sellerId) {
        throw new ApiError(400, 'نمی‌توانید با خودتان گفتگو کنید')
      }

      // Check if conversation already exists
      let conversation = await prisma.conversation.findFirst({
        where: {
          adId,
          buyerId,
          sellerId,
        },
        include: {
          ad: {
            select: {
              id: true,
              title: true,
              images: true,
              price: true,
              status: true,
            }
          },
          buyer: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              lastSeenAt: true,
            }
          },
          seller: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              lastSeenAt: true,
            }
          }
        }
      })

      // Create conversation if it doesn't exist
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            adId,
            buyerId,
            sellerId,
          },
          include: {
            ad: {
              select: {
                id: true,
                title: true,
                images: true,
                price: true,
                status: true,
              }
            },
            buyer: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                lastSeenAt: true,
              }
            },
            seller: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                lastSeenAt: true,
              }
            }
          }
        })

        logger.info('New conversation started', { 
          conversationId: conversation.id, 
          adId, 
          buyerId, 
          sellerId 
        })
      }

      res.status(201).json({
        message: 'مکالمه آماده است',
        data: conversation
      })

    } catch (error) {
      next(error)
    }
  }

  // Block/Unblock conversation
  static async toggleBlock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const userId = req.user!.id
      const { block } = req.body

      if (typeof block !== 'boolean') {
        throw new ApiError(400, 'وضعیت مسدودی معتبر نیست')
      }

      // Verify user has access to this conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          id,
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        }
      })

      if (!conversation) {
        throw new ApiError(404, 'مکالمه یافت نشد')
      }

      const isUserBuyer = conversation.buyerId === userId

      // Update block status
      await prisma.conversation.update({
        where: { id },
        data: {
          ...(isUserBuyer 
            ? { isBlockedByBuyer: block }
            : { isBlockedBySeller: block }
          )
        }
      })

      logger.info('Conversation block status changed', { 
        conversationId: id, 
        userId,
        blocked: block 
      })

      res.json({
        message: block ? 'مکالمه مسدود شد' : 'مسدودی مکالمه برداشته شد'
      })

    } catch (error) {
      next(error)
    }
  }

  // Get unread messages count
  static async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id

      const totalUnread = await prisma.conversation.aggregate({
        where: {
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        },
        _sum: {
          unreadCountBuyer: true,
          unreadCountSeller: true,
        }
      })

      // Calculate actual unread count for this user
      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        },
        select: {
          buyerId: true,
          sellerId: true,
          unreadCountBuyer: true,
          unreadCountSeller: true,
        }
      })

      const unreadCount = conversations.reduce((total, conv) => {
        const isUserBuyer = conv.buyerId === userId
        return total + (isUserBuyer ? conv.unreadCountBuyer : conv.unreadCountSeller)
      }, 0)

      res.json({
        data: {
          unreadCount
        }
      })

    } catch (error) {
      next(error)
    }
  }
}