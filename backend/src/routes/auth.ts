import { Router } from 'express'
import { body } from 'express-validator'
import { authController } from '@/controllers/auth-controller'
import { validateRequest } from '@/middleware/validate-request'
import { authMiddleware } from '@/middleware/auth'
import { asyncHandler } from '@/middleware/error-handler'

const router = Router()

// Register
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain uppercase, lowercase, number and special character'),
    body('fullName')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    body('phone')
      .optional()
      .matches(/^(\+98|0)?9\d{9}$/)
      .withMessage('Invalid Iranian phone number'),
  ],
  validateRequest,
  asyncHandler(authController.register)
)

// Login
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  validateRequest,
  asyncHandler(authController.login)
)

// Refresh token
router.post(
  '/refresh',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
  ],
  validateRequest,
  asyncHandler(authController.refreshToken)
)

// Logout
router.post(
  '/logout',
  authMiddleware,
  asyncHandler(authController.logout)
)

// Logout all devices
router.post(
  '/logout-all',
  authMiddleware,
  asyncHandler(authController.logoutAll)
)

// Verify email
router.post(
  '/verify-email',
  [
    body('token')
      .notEmpty()
      .withMessage('Verification token is required'),
  ],
  validateRequest,
  asyncHandler(authController.verifyEmail)
)

// Resend verification email
router.post(
  '/resend-verification',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
  ],
  validateRequest,
  asyncHandler(authController.resendVerification)
)

// Forgot password
router.post(
  '/forgot-password',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
  ],
  validateRequest,
  asyncHandler(authController.forgotPassword)
)

// Reset password
router.post(
  '/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain uppercase, lowercase, number and special character'),
  ],
  validateRequest,
  asyncHandler(authController.resetPassword)
)

// Change password
router.post(
  '/change-password',
  authMiddleware,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain uppercase, lowercase, number and special character'),
  ],
  validateRequest,
  asyncHandler(authController.changePassword)
)

// Get current user
router.get(
  '/me',
  authMiddleware,
  asyncHandler(authController.getCurrentUser)
)

// Update profile
router.patch(
  '/profile',
  authMiddleware,
  [
    body('fullName')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    body('phone')
      .optional()
      .matches(/^(\+98|0)?9\d{9}$/)
      .withMessage('Invalid Iranian phone number'),
    body('location')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Location must be less than 200 characters'),
    body('bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio must be less than 500 characters'),
  ],
  validateRequest,
  asyncHandler(authController.updateProfile)
)

// Verify phone
router.post(
  '/verify-phone',
  authMiddleware,
  [
    body('phone')
      .matches(/^(\+98|0)?9\d{9}$/)
      .withMessage('Invalid Iranian phone number'),
  ],
  validateRequest,
  asyncHandler(authController.verifyPhone)
)

// Confirm phone verification
router.post(
  '/confirm-phone',
  authMiddleware,
  [
    body('code')
      .isLength({ min: 4, max: 6 })
      .isNumeric()
      .withMessage('Invalid verification code'),
  ],
  validateRequest,
  asyncHandler(authController.confirmPhone)
)

// Delete account
router.delete(
  '/account',
  authMiddleware,
  [
    body('password')
      .notEmpty()
      .withMessage('Password is required for account deletion'),
  ],
  validateRequest,
  asyncHandler(authController.deleteAccount)
)

export default router