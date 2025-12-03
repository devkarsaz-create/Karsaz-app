import { Router } from 'express'
import { CategoryController } from '../controllers/category-controller'

const router = Router()

// Public routes
router.get('/', CategoryController.getCategories)
router.get('/popular', CategoryController.getPopularCategories)
router.get('/search', CategoryController.searchCategories)
router.get('/:id', CategoryController.getCategory)
router.get('/slug/:slug', CategoryController.getCategoryBySlug)

export default router