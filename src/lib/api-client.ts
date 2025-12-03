import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const { tokens } = useAuthStore.getState()
    
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const { tokens, setTokens, signOut } = useAuthStore.getState()
    const { addNotification } = useUIStore.getState()

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry && tokens?.refreshToken) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/refresh`,
          { refreshToken: tokens.refreshToken }
        )

        const newTokens = response.data.tokens
        setTokens(newTokens)

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed, sign out user
        signOut()
        addNotification({
          type: 'error',
          title: 'جلسه منقضی شده',
          message: 'لطفاً دوباره وارد شوید.',
        })
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login'
        }
        
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    if (error.response?.data?.message) {
      addNotification({
        type: 'error',
        title: 'خطا',
        message: error.response.data.message,
      })
    } else if (error.message) {
      addNotification({
        type: 'error',
        title: 'خطا در اتصال',
        message: 'لطفاً اتصال اینترنت خود را بررسی کنید.',
      })
    }

    return Promise.reject(error)
  }
)

// API response types
export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
  statusCode?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// API methods
export class ApiClient {
  // Auth endpoints
  static async register(data: {
    email: string
    password: string
    fullName?: string
    phone?: string
  }) {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  }

  static async login(data: { email: string; password: string }) {
    const response = await apiClient.post('/auth/login', data)
    return response.data
  }

  static async logout(refreshToken?: string) {
    const response = await apiClient.post('/auth/logout', { refreshToken })
    return response.data
  }

  static async refreshToken(refreshToken: string) {
    const response = await apiClient.post('/auth/refresh', { refreshToken })
    return response.data
  }

  static async getCurrentUser() {
    const response = await apiClient.get('/auth/me')
    return response.data
  }

  static async updateProfile(data: any) {
    const response = await apiClient.patch('/auth/profile', data)
    return response.data
  }

  static async changePassword(data: {
    currentPassword: string
    newPassword: string
  }) {
    const response = await apiClient.post('/auth/change-password', data)
    return response.data
  }

  static async forgotPassword(email: string) {
    const response = await apiClient.post('/auth/forgot-password', { email })
    return response.data
  }

  static async resetPassword(data: { token: string; password: string }) {
    const response = await apiClient.post('/auth/reset-password', data)
    return response.data
  }

  static async verifyEmail(token: string) {
    const response = await apiClient.post('/auth/verify-email', { token })
    return response.data
  }

  static async resendVerification(email: string) {
    const response = await apiClient.post('/auth/resend-verification', { email })
    return response.data
  }

  static async verifyPhone(phone: string) {
    const response = await apiClient.post('/auth/verify-phone', { phone })
    return response.data
  }

  static async confirmPhone(code: string) {
    const response = await apiClient.post('/auth/confirm-phone', { code })
    return response.data
  }

  // Categories endpoints
  static async getCategories() {
    const response = await apiClient.get('/categories')
    return response.data
  }

  static async getCategory(id: string) {
    const response = await apiClient.get(`/categories/${id}`)
    return response.data
  }

  // Ads endpoints
  static async getAds(params?: {
    page?: number
    limit?: number
    category?: string
    location?: string
    priceMin?: number
    priceMax?: number
    sortBy?: string
    search?: string
  }) {
    const response = await apiClient.get('/ads', { params })
    return response.data
  }

  static async getAd(id: string) {
    const response = await apiClient.get(`/ads/${id}`)
    return response.data
  }

  static async createAd(data: any) {
    const response = await apiClient.post('/ads', data)
    return response.data
  }

  static async updateAd(id: string, data: any) {
    const response = await apiClient.patch(`/ads/${id}`, data)
    return response.data
  }

  static async deleteAd(id: string) {
    const response = await apiClient.delete(`/ads/${id}`)
    return response.data
  }

  static async getUserAds(userId?: string, params?: any) {
    const url = userId ? `/ads/user/${userId}` : '/ads/my-ads'
    const response = await apiClient.get(url, { params })
    return response.data
  }

  static async getAdRecommendations(adId: string) {
    const response = await apiClient.get(`/ads/${adId}/recommendations`)
    return response.data
  }

  static async incrementAdViews(adId: string) {
    const response = await apiClient.post(`/ads/${adId}/view`)
    return response.data
  }

  // Search endpoints
  static async searchAds(params: {
    query?: string
    category?: string
    location?: string
    priceMin?: number
    priceMax?: number
    condition?: string
    sortBy?: string
    page?: number
    limit?: number
  }) {
    const response = await apiClient.get('/search', { params })
    return response.data
  }

  static async getSearchSuggestions(query: string) {
    const response = await apiClient.get('/search/suggestions', {
      params: { q: query }
    })
    return response.data
  }

  static async getTrendingSearches() {
    const response = await apiClient.get('/search/trending')
    return response.data
  }

  // Favorites endpoints
  static async getFavorites(params?: any) {
    const response = await apiClient.get('/users/favorites', { params })
    return response.data
  }

  static async addToFavorites(adId: string) {
    const response = await apiClient.post(`/users/favorites/${adId}`)
    return response.data
  }

  static async removeFromFavorites(adId: string) {
    const response = await apiClient.delete(`/users/favorites/${adId}`)
    return response.data
  }

  // Messages endpoints
  static async getConversations(params?: any) {
    const response = await apiClient.get('/messages/conversations', { params })
    return response.data
  }

  static async getConversation(id: string) {
    const response = await apiClient.get(`/messages/conversations/${id}`)
    return response.data
  }

  static async getMessages(conversationId: string, params?: any) {
    const response = await apiClient.get(`/messages/conversations/${conversationId}/messages`, { params })
    return response.data
  }

  static async sendMessage(conversationId: string, data: {
    content: string
    messageType?: string
    attachments?: any[]
  }) {
    const response = await apiClient.post(`/messages/conversations/${conversationId}/messages`, data)
    return response.data
  }

  static async markMessagesAsRead(conversationId: string, messageIds?: string[]) {
    const response = await apiClient.patch(`/messages/conversations/${conversationId}/read`, {
      messageIds
    })
    return response.data
  }

  // Upload endpoints
  static async uploadFile(file: File, type: 'image' | 'document' = 'image') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await apiClient.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  static async uploadMultipleFiles(files: File[], type: 'image' | 'document' = 'image') {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    formData.append('type', type)

    const response = await apiClient.post('/uploads/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  // Admin endpoints
  static async getAdminStats() {
    const response = await apiClient.get('/admin/stats')
    return response.data
  }

  static async getAdminUsers(params?: any) {
    const response = await apiClient.get('/admin/users', { params })
    return response.data
  }

  static async getAdminAds(params?: any) {
    const response = await apiClient.get('/admin/ads', { params })
    return response.data
  }

  static async updateUserStatus(userId: string, data: any) {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, data)
    return response.data
  }

  static async updateAdStatus(adId: string, data: any) {
    const response = await apiClient.patch(`/admin/ads/${adId}/status`, data)
    return response.data
  }
}

export default apiClient