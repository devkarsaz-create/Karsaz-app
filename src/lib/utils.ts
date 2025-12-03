import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'
import { faIR } from 'date-fns/locale'
import { CURRENCY, DATE_FORMATS, VALIDATION_RULES } from '@/constants'

// Tailwind CSS class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency with Persian locale
export function formatCurrency(
  amount: number,
  currency: keyof typeof CURRENCY = 'IRR',
  options?: {
    showSymbol?: boolean
    showCode?: boolean
    compact?: boolean
  }
): string {
  const { showSymbol = true, showCode = false, compact = false } = options || {}
  const currencyInfo = CURRENCY[currency]
  
  if (compact && amount >= 1000000) {
    const millions = amount / 1000000
    return `${millions.toFixed(1)}M ${showSymbol ? currencyInfo.symbol : ''}`
  }
  
  if (compact && amount >= 1000) {
    const thousands = amount / 1000
    return `${thousands.toFixed(1)}K ${showSymbol ? currencyInfo.symbol : ''}`
  }
  
  const formatted = new Intl.NumberFormat('fa-IR', {
    minimumFractionDigits: currencyInfo.decimals,
    maximumFractionDigits: currencyInfo.decimals,
  }).format(amount)
  
  let result = formatted
  if (showSymbol) result += ` ${currencyInfo.symbol}`
  if (showCode) result += ` ${currencyInfo.code}`
  
  return result
}

// Format date with Persian locale
export function formatDate(
  date: string | Date,
  formatType: keyof typeof DATE_FORMATS = 'DATE'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  
  if (!isValid(dateObj)) {
    return 'تاریخ نامعتبر'
  }
  
  switch (formatType) {
    case 'RELATIVE':
      return formatDistanceToNow(dateObj, { 
        addSuffix: true, 
        locale: faIR 
      })
    case 'FULL':
      return format(dateObj, DATE_FORMATS.FULL, { locale: faIR })
    case 'TIME':
      return format(dateObj, DATE_FORMATS.TIME, { locale: faIR })
    default:
      return format(dateObj, DATE_FORMATS.DATE, { locale: faIR })
  }
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

// Generate slug from Persian text
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\u200c]+/g, '-') // Replace spaces and ZWNJ with hyphens
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-z0-9\-]/g, '') // Keep only Persian, English, numbers, and hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

// Validate email
export function isValidEmail(email: string): boolean {
  return VALIDATION_RULES.email.pattern.test(email)
}

// Validate Iranian phone number
export function isValidPhone(phone: string): boolean {
  return VALIDATION_RULES.phone.pattern.test(phone)
}

// Validate password strength
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
} {
  const errors: string[] = []
  
  if (password.length < VALIDATION_RULES.password.minLength) {
    errors.push(`رمز عبور باید حداقل ${VALIDATION_RULES.password.minLength} کاراکتر باشد`)
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('رمز عبور باید شامل حروف کوچک انگلیسی باشد')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('رمز عبور باید شامل حروف بزرگ انگلیسی باشد')
  }
  
  if (!/\d/.test(password)) {
    errors.push('رمز عبور باید شامل عدد باشد')
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('رمز عبور باید شامل کاراکتر خاص باشد')
  }
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (errors.length === 0) {
    strength = 'strong'
  } else if (errors.length <= 2) {
    strength = 'medium'
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength
  }
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بایت'
  
  const k = 1024
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Generate random ID
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj = {} as { [key: string]: any }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj as T
  }
  return obj
}

// Check if object is empty
export function isEmpty(obj: any): boolean {
  if (obj == null) return true
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

// Get nested object property safely
export function get(obj: any, path: string, defaultValue?: any): any {
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue
    }
    result = result[key]
  }
  
  return result !== undefined ? result : defaultValue
}

// Set nested object property
export function set(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  let current = obj
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }
  
  current[keys[keys.length - 1]] = value
}

// Convert Persian/Arabic numbers to English
export function toEnglishNumbers(str: string): string {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  
  let result = str
  
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persianNumbers[i], 'g'), i.toString())
    result = result.replace(new RegExp(arabicNumbers[i], 'g'), i.toString())
  }
  
  return result
}

// Convert English numbers to Persian
export function toPersianNumbers(str: string): string {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  
  return str.replace(/\d/g, (match) => persianNumbers[parseInt(match)])
}

// Calculate reading time
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// Generate color from string
export function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const hue = hash % 360
  return `hsl(${hue}, 70%, 50%)`
}

// Check if device is mobile
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

// Check if device is tablet
export function isTablet(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= 768 && window.innerWidth < 1024
}

// Check if device is desktop
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= 1024
}

// Get device type
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (isMobile()) return 'mobile'
  if (isTablet()) return 'tablet'
  return 'desktop'
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      textArea.remove()
      return result
    }
  } catch (error) {
    console.error('Failed to copy text:', error)
    return false
  }
}

// Share content using Web Share API
export async function shareContent(data: {
  title?: string
  text?: string
  url?: string
}): Promise<boolean> {
  try {
    if (navigator.share) {
      await navigator.share(data)
      return true
    } else {
      // Fallback to copying URL
      if (data.url) {
        return await copyToClipboard(data.url)
      }
      return false
    }
  } catch (error) {
    console.error('Failed to share content:', error)
    return false
  }
}

// Format number with Persian locale
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fa-IR').format(num)
}

// Parse query string
export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString)
  const result: Record<string, string> = {}
  
  for (const [key, value] of params.entries()) {
    result[key] = value
  }
  
  return result
}

// Build query string
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  }
  
  return searchParams.toString()
}

// Retry async function
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxAttempts) {
        throw lastError
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw lastError!
}

// Sleep function
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Check if string is JSON
export function isJSON(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

// Safe JSON parse
export function safeJSONParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

// Get file extension
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

// Check if file is image
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

// Check if file is video
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/')
}

// Generate avatar URL from name
export function generateAvatarUrl(name: string): string {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6366f1&color=ffffff&size=200`
}

// Calculate distance between two coordinates
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Format distance
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} متر`
  }
  return `${distance.toFixed(1)} کیلومتر`
}
