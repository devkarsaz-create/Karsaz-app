import { Router } from 'express'
import { AdController } from '../controllers/ad-controller'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validate-request'
import rateLimit from 'express-rate-limit'

const router = Router()

// Rate limiting
const createAdLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 ads per hour
  message: {
    error: 'تعداد آگهی‌های ایجاد شده در ساعت گذشته بیش از حد مجاز است'
  }
})

const viewAdLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 views per minute
  message: {
    error: 'تعداد درخواست‌ها بیش از حد مجاز است'
  }
})

// Public routes
router.get('/', optionalAuthMiddleware, AdController.getAds)
router.get('/trending', AdController.getAds) // Same as getAds but with different default sorting
router.get('/:id', optionalAuthMiddleware, AdController.getAd)
router.post('/:id/view', viewAdLimit, AdController.incrementView)

// Protected routes
router.use(authMiddleware)

router.post('/', createAdLimit, AdController.createAd)
router.patch('/:id', AdController.updateAd)
router.delete('/:id', AdController.deleteAd)
router.patch('/:id/sold', AdController.markAsSold)
router.get('/user/my-ads', AdController.getUserAds)

export default router