import { Router } from 'express'
import { SearchController } from '../controllers/search-controller'
import rateLimit from 'express-rate-limit'

const router = Router()

// Rate limiting for search
const searchLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 searches per minute
  message: {
    error: 'تعداد جستجوها بیش از حد مجاز است'
  }
})

const suggestionsLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 suggestions per minute
  message: {
    error: 'تعداد درخواست‌ها بیش از حد مجاز است'
  }
})

// Public search routes
router.get('/', searchLimit, SearchController.search)
router.get('/suggestions', suggestionsLimit, SearchController.getSuggestions)
router.get('/trending', SearchController.getTrendingSearches)
router.post('/log', SearchController.saveSearchQuery)

export default router