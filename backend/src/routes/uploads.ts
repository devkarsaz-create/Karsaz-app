import { Router } from 'express'
import { UploadController } from '../controllers/upload-controller'
import { authMiddleware } from '../middleware/auth'
import rateLimit from 'express-rate-limit'

const router = Router()

// Rate limiting for uploads
const uploadLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: {
    error: 'تعداد آپلودها بیش از حد مجاز است'
  }
})

// All upload routes require authentication
router.use(authMiddleware)

// Upload routes
router.post('/', uploadLimit, UploadController.uploadSingle, UploadController.uploadFile)
router.post('/multiple', uploadLimit, UploadController.uploadMultiple, UploadController.uploadFiles)
router.post('/presigned-url', UploadController.generatePresignedUrl)

// File management routes
router.delete('/:filename', UploadController.deleteFile)
router.get('/:filename/info', UploadController.getFileInfo)
router.get('/stats', UploadController.getUploadStats)

export default router