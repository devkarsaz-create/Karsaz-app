import { Router } from 'express'
import { UserController } from '../controllers/user-controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// All user routes require authentication
router.use(authMiddleware)

// User profile routes
router.get('/profile', UserController.getProfile)
router.patch('/profile', UserController.updateProfile)
router.delete('/profile', UserController.deleteAccount)

// Favorites routes
router.get('/favorites', UserController.getFavorites)
router.post('/favorites/:adId', UserController.addToFavorites)
router.delete('/favorites/:adId', UserController.removeFromFavorites)

// User statistics
router.get('/stats', UserController.getUserStats)

export default router