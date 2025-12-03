// App Configuration
export const APP_CONFIG = {
  name: 'کارساز',
  nameEn: 'Karsaz',
  description: 'پلتفرم پیشرفته آگهی و نیازمندی',
  version: '2.0.0',
  author: 'Iran Trench',
  website: 'https://irantrench.com',
  email: 'info@irantrench.com',
  supportEmail: 'support@karsaz.app',
  social: {
    telegram: 'https://t.me/karsaz_app',
    instagram: 'https://instagram.com/karsaz_app',
    twitter: 'https://twitter.com/karsaz_app',
  },
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:12000',
  timeout: 30000,
  retries: 3,
  rateLimit: {
    requests: 100,
    window: 60000, // 1 minute
  },
} as const;

// Database Configuration
export const DB_CONFIG = {
  maxConnections: 20,
  connectionTimeout: 30000,
  queryTimeout: 60000,
  ssl: process.env.NODE_ENV === 'production',
} as const;

// File Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  allowedVideoTypes: ['video/mp4', 'video/webm'],
  allowedDocumentTypes: ['application/pdf', 'text/plain'],
  imageQuality: 0.8,
  thumbnailSize: { width: 300, height: 300 },
  mediumSize: { width: 800, height: 600 },
  largeSize: { width: 1200, height: 900 },
} as const;

// Pagination Configuration
export const PAGINATION_CONFIG = {
  defaultLimit: 20,
  maxLimit: 100,
  defaultPage: 1,
} as const;

// Search Configuration
export const SEARCH_CONFIG = {
  minQueryLength: 2,
  maxQueryLength: 100,
  debounceDelay: 300,
  maxSuggestions: 10,
  highlightTag: 'mark',
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  defaultTTL: 300, // 5 minutes
  longTTL: 3600, // 1 hour
  shortTTL: 60, // 1 minute
  keys: {
    categories: 'categories',
    featuredAds: 'featured-ads',
    userProfile: (userId: string) => `user-profile-${userId}`,
    adDetails: (adId: string) => `ad-details-${adId}`,
    searchResults: (query: string) => `search-${query}`,
  },
} as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'رایگان',
    nameEn: 'Free',
    price: 0,
    currency: 'IRR',
    interval: 'month' as const,
    features: {
      adsLimit: 5,
      imagesPerAd: 3,
      videoUpload: false,
      featuredAds: 0,
      prioritySupport: false,
      analytics: false,
      autoRenewal: false,
      adDuration: 30, // days
    },
    limits: {
      dailyAds: 1,
      monthlyAds: 5,
      totalActiveAds: 5,
    },
  },
  basic: {
    id: 'basic',
    name: 'پایه',
    nameEn: 'Basic',
    price: 99000,
    currency: 'IRR',
    interval: 'month' as const,
    features: {
      adsLimit: 25,
      imagesPerAd: 8,
      videoUpload: true,
      featuredAds: 2,
      prioritySupport: false,
      analytics: true,
      autoRenewal: true,
      adDuration: 60, // days
    },
    limits: {
      dailyAds: 5,
      monthlyAds: 25,
      totalActiveAds: 25,
    },
  },
  premium: {
    id: 'premium',
    name: 'پرمیوم',
    nameEn: 'Premium',
    price: 199000,
    currency: 'IRR',
    interval: 'month' as const,
    features: {
      adsLimit: -1, // unlimited
      imagesPerAd: 10,
      videoUpload: true,
      featuredAds: 10,
      prioritySupport: true,
      analytics: true,
      autoRenewal: true,
      adDuration: 90, // days
    },
    limits: {
      dailyAds: 20,
      monthlyAds: -1, // unlimited
      totalActiveAds: -1, // unlimited
    },
  },
} as const;

// Ad Status
export const AD_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  SOLD: 'sold',
  EXPIRED: 'expired',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
} as const;

// Ad Price Types
export const PRICE_TYPES = {
  FIXED: 'fixed',
  NEGOTIABLE: 'negotiable',
  FREE: 'free',
  CONTACT: 'contact',
} as const;

// Ad Conditions
export const CONDITIONS = {
  NEW: 'new',
  LIKE_NEW: 'like_new',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
} as const;

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  LOCATION: 'location',
  CONTACT: 'contact',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  NEW_MESSAGE: 'new_message',
  AD_EXPIRED: 'ad_expired',
  AD_SOLD: 'ad_sold',
  SUBSCRIPTION_EXPIRED: 'subscription_expired',
  SYSTEM_UPDATE: 'system_update',
  PROMOTION_AVAILABLE: 'promotion_available',
} as const;

// Report Types
export const REPORT_TYPES = {
  SPAM: 'spam',
  INAPPROPRIATE: 'inappropriate',
  FAKE: 'fake',
  SCAM: 'scam',
  OTHER: 'other',
} as const;

// Sort Options
export const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  PRICE_LOW: 'price_low',
  PRICE_HIGH: 'price_high',
  MOST_VIEWED: 'most_viewed',
  MOST_RELEVANT: 'most_relevant',
} as const;

// Iranian Cities
export const IRANIAN_CITIES = [
  'تهران',
  'مشهد',
  'اصفهان',
  'شیراز',
  'تبریز',
  'کرج',
  'اهواز',
  'قم',
  'کرمانشاه',
  'ارومیه',
  'رشت',
  'زاهدان',
  'همدان',
  'کرمان',
  'یزد',
  'اردبیل',
  'بندرعباس',
  'اراک',
  'ایلام',
  'قزوین',
  'زنجان',
  'گرگان',
  'ساری',
  'بوشهر',
  'سنندج',
  'بیرجند',
  'خرم‌آباد',
  'شهرکرد',
  'یاسوج',
  'سمنان',
] as const;

// Currency
export const CURRENCY = {
  IRR: {
    code: 'IRR',
    symbol: '﷼',
    name: 'ریال ایران',
    nameEn: 'Iranian Rial',
    decimals: 0,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'دلار آمریکا',
    nameEn: 'US Dollar',
    decimals: 2,
  },
} as const;

// Date Formats
export const DATE_FORMATS = {
  FULL: 'yyyy/MM/dd HH:mm:ss',
  DATE: 'yyyy/MM/dd',
  TIME: 'HH:mm',
  RELATIVE: 'relative',
  JALALI_FULL: 'yyyy/MM/dd HH:mm:ss',
  JALALI_DATE: 'yyyy/MM/dd',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  title: {
    minLength: 5,
    maxLength: 100,
  },
  description: {
    minLength: 20,
    maxLength: 2000,
  },
  price: {
    min: 0,
    max: 999999999999,
  },
  phone: {
    pattern: /^(\+98|0)?9\d{9}$/,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'خطا در اتصال به شبکه',
  SERVER_ERROR: 'خطا در سرور',
  UNAUTHORIZED: 'دسترسی غیرمجاز',
  FORBIDDEN: 'عدم دسترسی',
  NOT_FOUND: 'یافت نشد',
  VALIDATION_ERROR: 'خطا در اعتبارسنجی',
  UPLOAD_ERROR: 'خطا در آپلود فایل',
  PAYMENT_ERROR: 'خطا در پرداخت',
  SUBSCRIPTION_EXPIRED: 'اشتراک منقضی شده',
  RATE_LIMIT_EXCEEDED: 'تعداد درخواست‌ها بیش از حد مجاز',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  AD_CREATED: 'آگهی با موفقیت ایجاد شد',
  AD_UPDATED: 'آگهی با موفقیت بروزرسانی شد',
  AD_DELETED: 'آگهی با موفقیت حذف شد',
  PROFILE_UPDATED: 'پروفایل با موفقیت بروزرسانی شد',
  MESSAGE_SENT: 'پیام با موفقیت ارسال شد',
  SUBSCRIPTION_ACTIVATED: 'اشتراک با موفقیت فعال شد',
  PAYMENT_SUCCESSFUL: 'پرداخت با موفقیت انجام شد',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_CHAT: true,
  ENABLE_VIDEO_UPLOAD: true,
  ENABLE_LOCATION_SEARCH: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_A_B_TESTING: false,
  ENABLE_DARK_MODE: true,
  ENABLE_PWA: true,
} as const;

// Analytics Events
export const ANALYTICS_EVENTS = {
  AD_VIEW: 'ad_view',
  AD_CONTACT: 'ad_contact',
  AD_FAVORITE: 'ad_favorite',
  AD_SHARE: 'ad_share',
  SEARCH_PERFORMED: 'search_performed',
  CATEGORY_CLICKED: 'category_clicked',
  USER_REGISTERED: 'user_registered',
  USER_LOGIN: 'user_login',
  SUBSCRIPTION_PURCHASED: 'subscription_purchased',
  MESSAGE_SENT: 'message_sent',
} as const;

// SEO Configuration
export const SEO_CONFIG = {
  defaultTitle: 'کارساز - پلتفرم آگهی و نیازمندی',
  titleTemplate: '%s | کارساز',
  defaultDescription: 'بهترین پلتفرم برای انتشار و جستجوی آگهی‌ها و نیازمندی‌ها در ایران',
  defaultKeywords: ['آگهی', 'نیازمندی', 'خرید', 'فروش', 'کارساز', 'ایران'],
  defaultImage: '/images/og-image.jpg',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://karsaz.app',
  twitterHandle: '@karsaz_app',
} as const;

// PWA Configuration
export const PWA_CONFIG = {
  name: 'کارساز',
  shortName: 'کارساز',
  description: 'پلتفرم آگهی و نیازمندی',
  themeColor: '#6366f1',
  backgroundColor: '#0f172a',
  display: 'standalone',
  orientation: 'portrait',
  scope: '/',
  startUrl: '/',
} as const;

// Export all constants as a single object for easier importing
export const CONSTANTS = {
  APP_CONFIG,
  API_CONFIG,
  DB_CONFIG,
  UPLOAD_CONFIG,
  PAGINATION_CONFIG,
  SEARCH_CONFIG,
  CACHE_CONFIG,
  SUBSCRIPTION_PLANS,
  AD_STATUS,
  PRICE_TYPES,
  CONDITIONS,
  MESSAGE_TYPES,
  NOTIFICATION_TYPES,
  REPORT_TYPES,
  SORT_OPTIONS,
  IRANIAN_CITIES,
  CURRENCY,
  DATE_FORMATS,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURE_FLAGS,
  ANALYTICS_EVENTS,
  SEO_CONFIG,
  PWA_CONFIG,
} as const;