import { Router } from 'express'
import { MessageController } from '../controllers/message-controller'
import { authMiddleware } from '../middleware/auth'
import rateLimit from 'express-rate-limit'

const router = Router()

// Rate limiting for messaging
const messageLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  message: {
    error: 'تعداد پیام‌های ارسالی بیش از حد مجاز است'
  }
})

// All message routes require authentication
router.use(authMiddleware)

// Conversation routes
router.get('/conversations', MessageController.getConversations)
router.post('/conversations', MessageController.startConversation)
router.get('/conversations/:id', MessageController.getConversation)
router.patch('/conversations/:id/block', MessageController.toggleBlock)

// Message routes
router.get('/conversations/:id/messages', MessageController.getMessages)
router.post('/conversations/:id/messages', messageLimit, MessageController.sendMessage)
router.patch('/conversations/:id/read', MessageController.markMessagesAsRead)

// Utility routes
router.get('/unread-count', MessageController.getUnreadCount)

export default router