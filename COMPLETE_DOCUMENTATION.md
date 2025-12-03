# 📚 مستندات کامل کارساز - Karsaz App

## 🎯 راهنمای جامع برای توسعه‌دهندگان Frontend

این مستند شامل تمام جزئیات فنی، معماری، API endpoints، و راهنمای کامل برای توسعه Frontend مطابق با Backend موجود است.

---

## 📋 فهرست مطالب

1. [معماری کلی سیستم](#معماری-کلی-سیستم)
2. [Backend Architecture](#backend-architecture)
3. [Database Schema](#database-schema)
4. [API Documentation](#api-documentation)
5. [Authentication System](#authentication-system)
6. [Real-time Features](#real-time-features)
7. [File Management](#file-management)
8. [Frontend Development Guide](#frontend-development-guide)
9. [Docker & Deployment](#docker--deployment)
10. [Environment Configuration](#environment-configuration)

---

## 🏗️ معماری کلی سیستم

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Admin Panel   │    │     Nginx       │
│   Next.js 15    │    │   Next.js 15    │    │ Reverse Proxy   │
│   Port: 12000   │    │   Port: 12001   │    │   Port: 80/443  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Backend API   │
                    │ Node.js/Express │
                    │   Port: 3001    │
                    └─────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ PostgreSQL  │    │    Redis    │    │    MinIO    │
│ Port: 5432  │    │ Port: 6379  │    │ Port: 9000  │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Technology Stack

#### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL 16 + Prisma ORM
- **Cache**: Redis 7
- **Authentication**: JWT + Refresh Tokens
- **Real-time**: Socket.io
- **File Storage**: MinIO Object Storage
- **Validation**: Zod
- **Security**: Argon2, Rate Limiting, CORS
- **Logging**: Winston
- **Monitoring**: Prometheus + Grafana

#### Frontend (راهنمای توسعه)
- **Framework**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Icons**: Lucide React
- **PWA**: Next.js PWA

---

## 🔧 Backend Architecture

### Directory Structure
```
backend/
├── src/
│   ├── config/              # تنظیمات سیستم
│   │   ├── database.ts      # اتصال Prisma
│   │   ├── env.ts          # Environment validation
│   │   ├── redis.ts        # Redis configuration
│   │   └── socket.ts       # Socket.io setup
│   ├── controllers/         # کنترلرهای API
│   │   ├── auth-controller.ts
│   │   ├── user-controller.ts
│   │   ├── ad-controller.ts
│   │   └── message-controller.ts
│   ├── middleware/          # میدل‌ویرها
│   │   ├── auth.ts         # احراز هویت
│   │   ├── error-handler.ts # مدیریت خطا
│   │   ├── rate-limit.ts   # محدودیت درخواست
│   │   └── validate-request.ts
│   ├── routes/             # مسیرهای API
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── ads.ts
│   │   └── messages.ts
│   ├── services/           # سرویس‌های کاربردی
│   │   ├── email-service.ts
│   │   ├── sms-service.ts
│   │   └── file-service.ts
│   ├── utils/              # ابزارهای کمکی
│   │   ├── logger.ts
│   │   ├── api-error.ts
│   │   └── helpers.ts
│   └── server.ts           # سرور اصلی
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts            # داده‌های اولیه
├── uploads/               # فایل‌های آپلود شده
├── logs/                  # فایل‌های لاگ
├── package.json
├── tsconfig.json
└── Dockerfile
```

### Core Services

#### 1. Database Service (Prisma)
```typescript
// config/database.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
})

export { prisma }
```

#### 2. Redis Cache Service
```typescript
// config/redis.ts
export class CacheService {
  async get<T>(key: string): Promise<T | null>
  async set(key: string, value: any, ttl?: number): Promise<boolean>
  async del(key: string): Promise<boolean>
  async increment(key: string, ttl?: number): Promise<number>
  // ... سایر متدها
}
```

#### 3. Authentication Middleware
```typescript
// middleware/auth.ts
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    isVerified: boolean
    isPremium: boolean
  }
}

export const authMiddleware: RequestHandler
export const optionalAuthMiddleware: RequestHandler
export const requireRole: (roles: string[]) => RequestHandler
export const requireAdmin: RequestHandler
export const requireVerified: RequestHandler
```

---

## 🗄️ Database Schema

### Core Models

#### User Model
```prisma
model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  password              String?
  fullName              String?
  avatarUrl             String?
  phone                 String?   @unique
  phoneVerified         DateTime?
  location              String?
  bio                   String?
  
  // Status fields
  isVerified            Boolean   @default(false)
  isPremium             Boolean   @default(false)
  role                  UserRole  @default(USER)
  subscriptionType      SubscriptionType @default(FREE)
  subscriptionExpiresAt DateTime?
  
  // Settings
  settings              Json?
  socialLinks           Json?
  
  // Stats
  rating                Float?
  totalRatings          Int       @default(0)
  
  // Timestamps
  emailVerified         DateTime?
  lastSeenAt            DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  deletedAt             DateTime?
  
  // Relations
  ads                   Ad[]
  sentMessages          Message[] @relation("SentMessages")
  receivedMessages      Message[] @relation("ReceivedMessages")
  favorites             Favorite[]
  reviews               Review[]  @relation("ReviewsGiven")
  receivedReviews       Review[]  @relation("ReviewsReceived")
  refreshTokens         RefreshToken[]
  
  @@map("users")
}
```

#### Ad Model
```prisma
model Ad {
  id              String     @id @default(cuid())
  title           String
  description     String
  price           Decimal?
  images          String[]
  condition       Condition  @default(NEW)
  status          AdStatus   @default(ACTIVE)
  
  // Location
  location        String?
  latitude        Float?
  longitude       Float?
  
  // Category
  categoryId      String
  category        Category   @relation(fields: [categoryId], references: [id])
  
  // User
  userId          String
  user            User       @relation(fields: [userId], references: [id])
  
  // Stats
  viewCount       Int        @default(0)
  favoriteCount   Int        @default(0)
  
  // Features
  isPremium       Boolean    @default(false)
  isUrgent        Boolean    @default(false)
  isFeatured      Boolean    @default(false)
  
  // Timestamps
  expiresAt       DateTime?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  deletedAt       DateTime?
  
  // Relations
  messages        Message[]
  favorites       Favorite[]
  reviews         Review[]
  conversations   Conversation[]
  
  @@map("ads")
}
```

#### Message Model
```prisma
model Message {
  id             String      @id @default(cuid())
  content        String
  messageType    MessageType @default(TEXT)
  attachments    Json?
  
  // Relations
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  adId           String
  ad             Ad          @relation(fields: [adId], references: [id])
  senderId       String
  sender         User        @relation("SentMessages", fields: [senderId], references: [id])
  receiverId     String
  receiver       User        @relation("ReceivedMessages", fields: [receiverId], references: [id])
  
  // Status
  isRead         Boolean     @default(false)
  readAt         DateTime?
  
  // Timestamps
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  deletedAt      DateTime?
  
  @@map("messages")
}
```

### Enums
```prisma
enum UserRole {
  USER
  MODERATOR
  ADMIN
}

enum SubscriptionType {
  FREE
  BASIC
  PREMIUM
  BUSINESS
}

enum AdStatus {
  DRAFT
  ACTIVE
  SOLD
  EXPIRED
  SUSPENDED
  DELETED
}

enum Condition {
  NEW
  LIKE_NEW
  GOOD
  FAIR
  POOR
}

enum MessageType {
  TEXT
  IMAGE
  DOCUMENT
  LOCATION
  CONTACT
}
```

---

## 🔌 API Documentation

### Base URL
```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

### Authentication Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Response Format
```typescript
interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
  statusCode?: number
}

interface PaginatedResponse<T> {
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
```

### Authentication Endpoints

#### POST /api/auth/register
```typescript
// Request
interface RegisterRequest {
  email: string
  password: string
  fullName?: string
  phone?: string
}

// Response
interface RegisterResponse {
  message: string
  user: {
    id: string
    email: string
    fullName?: string
    isVerified: boolean
    isPremium: boolean
    role: string
    createdAt: string
  }
  tokens: {
    accessToken: string
    refreshToken: string
  }
}
```

#### POST /api/auth/login
```typescript
// Request
interface LoginRequest {
  email: string
  password: string
}

// Response
interface LoginResponse {
  message: string
  user: UserProfile
  tokens: {
    accessToken: string
    refreshToken: string
  }
}
```

#### POST /api/auth/refresh
```typescript
// Request
interface RefreshRequest {
  refreshToken: string
}

// Response
interface RefreshResponse {
  tokens: {
    accessToken: string
    refreshToken: string
  }
}
```

#### GET /api/auth/me
```typescript
// Response
interface CurrentUserResponse {
  user: {
    id: string
    email: string
    fullName?: string
    avatarUrl?: string
    phone?: string
    phoneVerified?: string
    location?: string
    bio?: string
    isVerified: boolean
    isPremium: boolean
    role: string
    subscriptionType: string
    subscriptionExpiresAt?: string
    settings?: any
    socialLinks?: any
    rating?: number
    totalRatings: number
    createdAt: string
    updatedAt: string
  }
}
```

### Ads Endpoints

#### GET /api/ads
```typescript
// Query Parameters
interface AdsQuery {
  page?: number          // صفحه (پیش‌فرض: 1)
  limit?: number         // تعداد در صفحه (پیش‌فرض: 20)
  category?: string      // ID دسته‌بندی
  location?: string      // موقعیت
  priceMin?: number      // حداقل قیمت
  priceMax?: number      // حداکثر قیمت
  condition?: string     // وضعیت کالا
  sortBy?: string        // مرتب‌سازی: 'newest' | 'oldest' | 'price_asc' | 'price_desc'
  search?: string        // جستجو در عنوان و توضیحات
}

// Response
interface AdsResponse {
  data: Ad[]
  pagination: PaginationInfo
}
```

#### GET /api/ads/:id
```typescript
// Response
interface AdResponse {
  data: {
    id: string
    title: string
    description: string
    price?: number
    images: string[]
    condition: string
    status: string
    location?: string
    latitude?: number
    longitude?: number
    viewCount: number
    favoriteCount: number
    isPremium: boolean
    isUrgent: boolean
    isFeatured: boolean
    expiresAt?: string
    createdAt: string
    updatedAt: string
    category: {
      id: string
      name: string
      slug: string
    }
    user: {
      id: string
      fullName?: string
      avatarUrl?: string
      rating?: number
      totalRatings: number
      lastSeenAt?: string
    }
  }
}
```

#### POST /api/ads
```typescript
// Request (multipart/form-data for images)
interface CreateAdRequest {
  title: string
  description: string
  price?: number
  categoryId: string
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR'
  location?: string
  latitude?: number
  longitude?: number
  isPremium?: boolean
  isUrgent?: boolean
  images?: File[]  // حداکثر 10 تصویر
}

// Response
interface CreateAdResponse {
  message: string
  data: Ad
}
```

### Messages Endpoints

#### GET /api/messages/conversations
```typescript
// Response
interface ConversationsResponse {
  data: {
    id: string
    adId: string
    ad: {
      id: string
      title: string
      images: string[]
      price?: number
    }
    buyerId: string
    sellerId: string
    otherUser: {
      id: string
      fullName?: string
      avatarUrl?: string
      lastSeenAt?: string
    }
    lastMessage?: {
      id: string
      content: string
      senderId: string
      createdAt: string
    }
    unreadCount: number
    lastMessageAt?: string
    createdAt: string
  }[]
}
```

#### GET /api/messages/conversations/:id/messages
```typescript
// Query Parameters
interface MessagesQuery {
  page?: number
  limit?: number
}

// Response
interface MessagesResponse {
  data: {
    id: string
    content: string
    messageType: string
    attachments?: any
    senderId: string
    receiverId: string
    sender: {
      id: string
      fullName?: string
      avatarUrl?: string
    }
    isRead: boolean
    readAt?: string
    createdAt: string
  }[]
  pagination: PaginationInfo
}
```

### Search Endpoints

#### GET /api/search
```typescript
// Query Parameters
interface SearchQuery {
  query?: string         // متن جستجو
  category?: string      // دسته‌بندی
  location?: string      // موقعیت
  priceMin?: number      // حداقل قیمت
  priceMax?: number      // حداکثر قیمت
  condition?: string     // وضعیت
  sortBy?: string        // مرتب‌سازی
  page?: number
  limit?: number
}

// Response
interface SearchResponse {
  data: Ad[]
  pagination: PaginationInfo
  filters: {
    categories: { id: string, name: string, count: number }[]
    locations: { name: string, count: number }[]
    priceRanges: { min: number, max: number, count: number }[]
  }
}
```

#### GET /api/search/suggestions
```typescript
// Query Parameters
interface SuggestionsQuery {
  q: string  // متن جستجو
}

// Response
interface SuggestionsResponse {
  data: {
    suggestions: string[]
    categories: { id: string, name: string }[]
    locations: string[]
  }
}
```

### File Upload Endpoints

#### POST /api/uploads
```typescript
// Request (multipart/form-data)
interface UploadRequest {
  file: File
  type: 'image' | 'document'
}

// Response
interface UploadResponse {
  data: {
    url: string
    filename: string
    size: number
    mimeType: string
  }
}
```

---

## 🔐 Authentication System

### JWT Token Structure
```typescript
// Access Token Payload
interface AccessTokenPayload {
  userId: string
  iat: number
  exp: number
}

// Refresh Token Payload
interface RefreshTokenPayload {
  userId: string
  iat: number
  exp: number
}
```

### Token Lifecycle
1. **Login**: دریافت Access Token (15 دقیقه) + Refresh Token (7 روز)
2. **API Calls**: استفاده از Access Token در header
3. **Token Refresh**: استفاده از Refresh Token برای دریافت Access Token جدید
4. **Logout**: حذف Refresh Token از دیتابیس

### Frontend Authentication Flow
```typescript
// stores/auth-store.ts
interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  isInitialized: boolean
  
  setUser: (user: User | null) => void
  setTokens: (tokens: AuthTokens | null) => void
  signOut: () => void
  
  isAuthenticated: () => boolean
  isPremium: () => boolean
  isVerified: () => boolean
  isAdmin: () => boolean
}

// lib/api-client.ts
class ApiClient {
  // Auto token refresh در interceptors
  static setupInterceptors() {
    apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Try refresh token
          // If refresh fails, logout user
        }
        return Promise.reject(error)
      }
    )
  }
}
```

---

## ⚡ Real-time Features

### Socket.io Events

#### Client to Server Events
```typescript
// اتصال با authentication
socket.auth = { token: accessToken }

// پیوستن به مکالمه
socket.emit('join_conversation', conversationId)

// ارسال پیام
socket.emit('send_message', {
  conversationId: string
  content: string
  messageType?: 'TEXT' | 'IMAGE' | 'DOCUMENT'
  attachments?: any[]
})

// نشان دادن typing
socket.emit('typing_start', { conversationId })
socket.emit('typing_stop', { conversationId })

// خواندن پیام‌ها
socket.emit('mark_messages_read', {
  conversationId: string
  messageIds?: string[]
})
```

#### Server to Client Events
```typescript
// پیام جدید
socket.on('new_message', (data: {
  message: Message
  conversationId: string
}) => {
  // Update UI
})

// اعلان پیام
socket.on('message_notification', (data: {
  conversationId: string
  message: Message
  ad: { id: string, title: string }
}) => {
  // Show notification
})

// وضعیت typing
socket.on('user_typing', (data: {
  userId: string
  conversationId: string
}) => {
  // Show typing indicator
})

// خوانده شدن پیام‌ها
socket.on('messages_read', (data: {
  conversationId: string
  readBy: string
  messageIds?: string[]
}) => {
  // Update message status
})

// وضعیت آنلاین کاربران
socket.on('user_presence_updated', (data: {
  userId: string
  status: 'online' | 'offline' | 'away'
}) => {
  // Update user status
})
```

### Frontend Socket Integration
```typescript
// lib/socket.ts
import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  
  connect(token: string) {
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token }
    })
    
    this.setupEventListeners()
  }
  
  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }
  
  joinConversation(conversationId: string) {
    this.socket?.emit('join_conversation', conversationId)
  }
  
  sendMessage(data: SendMessageData) {
    this.socket?.emit('send_message', data)
  }
  
  private setupEventListeners() {
    this.socket?.on('new_message', this.handleNewMessage)
    this.socket?.on('message_notification', this.handleMessageNotification)
    // ... سایر event handlers
  }
}

export const socketService = new SocketService()
```

---

## 📁 File Management

### MinIO Configuration
```typescript
// Backend file service
class FileService {
  private minioClient: Client
  
  async uploadFile(file: Buffer, filename: string, mimeType: string): Promise<string>
  async deleteFile(filename: string): Promise<boolean>
  async getFileUrl(filename: string): Promise<string>
  async generatePresignedUrl(filename: string, expiry: number): Promise<string>
}
```

### Frontend File Upload
```typescript
// components/FileUpload.tsx
interface FileUploadProps {
  maxFiles?: number
  maxSize?: number
  acceptedTypes?: string[]
  onUpload: (files: UploadedFile[]) => void
}

// Usage
<FileUpload
  maxFiles={10}
  maxSize={10 * 1024 * 1024} // 10MB
  acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
  onUpload={(files) => {
    // Handle uploaded files
  }}
/>
```

### Image Processing
```typescript
// Frontend image utilities
class ImageUtils {
  static async resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<File>
  static async compressImage(file: File, quality: number): Promise<File>
  static generateThumbnail(file: File, size: number): Promise<File>
}
```

---

## 🎨 Frontend Development Guide

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages group
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/       # Dashboard pages group
│   │   ├── profile/
│   │   ├── ads/
│   │   ├── messages/
│   │   └── layout.tsx
│   ├── ads/               # Public ad pages
│   │   ├── [id]/
│   │   └── page.tsx
│   ├── search/
│   ├── categories/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   └── ...
│   ├── forms/            # Form components
│   │   ├── LoginForm.tsx
│   │   ├── AdForm.tsx
│   │   └── ...
│   ├── layout/           # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   └── features/         # Feature-specific components
│       ├── ads/
│       ├── messages/
│       ├── search/
│       └── ...
├── lib/                  # Utilities and configurations
│   ├── api-client.ts     # API client
│   ├── socket.ts         # Socket.io client
│   ├── utils.ts          # Helper functions
│   ├── validations.ts    # Zod schemas
│   └── constants.ts      # App constants
├── stores/               # Zustand stores
│   ├── auth-store.ts
│   ├── ads-store.ts
│   ├── messages-store.ts
│   ├── ui-store.ts
│   └── ...
├── hooks/                # Custom hooks
│   ├── useAuth.ts
│   ├── useSocket.ts
│   ├── useLocalStorage.ts
│   └── ...
├── types/                # TypeScript types
│   ├── api.ts
│   ├── database.ts
│   └── ...
└── styles/               # Additional styles
    └── components.css
```

### State Management with Zustand

#### Auth Store
```typescript
// stores/auth-store.ts
interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  isInitialized: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setTokens: (tokens: AuthTokens | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  signOut: () => void
  
  // Computed
  isAuthenticated: () => boolean
  isPremium: () => boolean
  isVerified: () => boolean
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Implementation
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

#### Ads Store
```typescript
// stores/ads-store.ts
interface AdsState {
  ads: Ad[]
  currentAd: Ad | null
  favorites: string[]
  isLoading: boolean
  filters: SearchFilters
  pagination: PaginationInfo
  
  // Actions
  setAds: (ads: Ad[]) => void
  setCurrentAd: (ad: Ad | null) => void
  addToFavorites: (adId: string) => void
  removeFromFavorites: (adId: string) => void
  setFilters: (filters: SearchFilters) => void
  
  // Async actions
  fetchAds: (params?: SearchParams) => Promise<void>
  fetchAd: (id: string) => Promise<void>
  createAd: (data: CreateAdData) => Promise<Ad>
  updateAd: (id: string, data: UpdateAdData) => Promise<Ad>
  deleteAd: (id: string) => Promise<void>
}
```

#### Messages Store
```typescript
// stores/messages-store.ts
interface MessagesState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  unreadCount: number
  isLoading: boolean
  
  // Actions
  setConversations: (conversations: Conversation[]) => void
  setCurrentConversation: (conversation: Conversation | null) => void
  addMessage: (message: Message) => void
  markAsRead: (conversationId: string, messageIds?: string[]) => void
  
  // Async actions
  fetchConversations: () => Promise<void>
  fetchMessages: (conversationId: string) => Promise<void>
  sendMessage: (data: SendMessageData) => Promise<void>
}
```

### Custom Hooks

#### useAuth Hook
```typescript
// hooks/useAuth.ts
export function useAuth() {
  const {
    user,
    tokens,
    isLoading,
    isAuthenticated,
    isPremium,
    isVerified,
    isAdmin,
    setUser,
    setTokens,
    signOut
  } = useAuthStore()
  
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await ApiClient.login(credentials)
      setUser(response.user)
      setTokens(response.tokens)
      return response
    } catch (error) {
      throw error
    }
  }
  
  const register = async (data: RegisterData) => {
    try {
      const response = await ApiClient.register(data)
      setUser(response.user)
      setTokens(response.tokens)
      return response
    } catch (error) {
      throw error
    }
  }
  
  const logout = async () => {
    try {
      if (tokens?.refreshToken) {
        await ApiClient.logout(tokens.refreshToken)
      }
    } finally {
      signOut()
      socketService.disconnect()
    }
  }
  
  return {
    user,
    isLoading,
    isAuthenticated: isAuthenticated(),
    isPremium: isPremium(),
    isVerified: isVerified(),
    isAdmin: isAdmin(),
    login,
    register,
    logout
  }
}
```

#### useSocket Hook
```typescript
// hooks/useSocket.ts
export function useSocket() {
  const { tokens, isAuthenticated } = useAuthStore()
  const { addMessage, markAsRead } = useMessagesStore()
  const { addNotification } = useUIStore()
  
  useEffect(() => {
    if (isAuthenticated() && tokens?.accessToken) {
      socketService.connect(tokens.accessToken)
      
      // Setup event listeners
      socketService.on('new_message', (data) => {
        addMessage(data.message)
      })
      
      socketService.on('message_notification', (data) => {
        addNotification({
          type: 'info',
          title: 'پیام جدید',
          message: `پیام جدید از ${data.message.sender.fullName}`,
        })
      })
      
      return () => {
        socketService.disconnect()
      }
    }
  }, [isAuthenticated(), tokens?.accessToken])
  
  return {
    joinConversation: socketService.joinConversation.bind(socketService),
    sendMessage: socketService.sendMessage.bind(socketService),
    startTyping: socketService.startTyping.bind(socketService),
    stopTyping: socketService.stopTyping.bind(socketService),
  }
}
```

### Form Handling with React Hook Form

#### Login Form
```typescript
// components/forms/LoginForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
      // Redirect to dashboard
    } catch (error) {
      // Handle error
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register('email')}
          type="email"
          placeholder="ایمیل"
          error={errors.email?.message}
        />
      </div>
      <div>
        <Input
          {...register('password')}
          type="password"
          placeholder="رمز عبور"
          error={errors.password?.message}
        />
      </div>
      <Button type="submit" loading={isSubmitting} className="w-full">
        ورود
      </Button>
    </form>
  )
}
```

#### Ad Creation Form
```typescript
// components/forms/AdForm.tsx
const adSchema = z.object({
  title: z.string().min(10, 'عنوان باید حداقل 10 کاراکتر باشد'),
  description: z.string().min(50, 'توضیحات باید حداقل 50 کاراکتر باشد'),
  price: z.number().positive('قیمت باید مثبت باشد').optional(),
  categoryId: z.string().min(1, 'دسته‌بندی را انتخاب کنید'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
  location: z.string().optional(),
  images: z.array(z.instanceof(File)).max(10, 'حداکثر 10 تصویر'),
})

export function AdForm({ initialData, onSubmit }: AdFormProps) {
  const { categories } = useCategoriesStore()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
    defaultValues: initialData
  })
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Form fields */}
    </form>
  )
}
```

### UI Components with Radix UI

#### Button Component
```typescript
// components/ui/button.tsx
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    )
  }
)
```

### PWA Configuration

#### next.config.mjs
```javascript
import withPWA from 'next-pwa'

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        }
      }
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        }
      }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /^https:\/\/.*\.(?:json)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'json-cache'
      }
    },
    {
      urlPattern: /\/api\/.*$/i,
      handler: 'NetworkFirst',
      method: 'GET',
      options: {
        cacheName: 'apis',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        networkTimeoutSeconds: 10 // fall back to cache if api does not response within 10 seconds
      }
    }
  ]
})({
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'your-domain.com'],
  },
})

export default nextConfig
```

#### manifest.json
```json
{
  "name": "کارساز - Karsaz App",
  "short_name": "کارساز",
  "description": "پلتفرم آگهی‌های رایگان",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f0f0f",
  "theme_color": "#6366f1",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ]
}
```

---

## 🐳 Docker & Deployment

### Complete Docker Setup

#### docker-compose.yml
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: karsaz-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: karsaz
      POSTGRES_USER: karsaz
      POSTGRES_PASSWORD: karsaz_password_2024
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - karsaz-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U karsaz -d karsaz"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: karsaz-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass redis_password_2024
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - karsaz-network

  # MinIO Object Storage
  minio:
    image: minio/minio:latest
    container_name: karsaz-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: karsaz_minio
      MINIO_ROOT_PASSWORD: karsaz_minio_password_2024
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    networks:
      - karsaz-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: karsaz-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: postgresql://karsaz:karsaz_password_2024@postgres:5432/karsaz
      REDIS_URL: redis://:redis_password_2024@redis:6379
      JWT_SECRET: karsaz_jwt_secret_very_long_and_secure_key_2024
      JWT_REFRESH_SECRET: karsaz_jwt_refresh_secret_very_long_and_secure_key_2024
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/logs:/app/logs
    ports:
      - "3001:3001"
    networks:
      - karsaz-network
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  # Frontend Application
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: karsaz-frontend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: http://localhost:3001/api
      NEXT_PUBLIC_SOCKET_URL: http://localhost:3001
    ports:
      - "12000:3000"
    networks:
      - karsaz-network
    depends_on:
      - backend

  # Admin Panel
  admin:
    build:
      context: ./admin-panel
      dockerfile: Dockerfile
    container_name: karsaz-admin
    restart: unless-stopped
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: http://localhost:3001/api
    ports:
      - "12001:3000"
    networks:
      - karsaz-network
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
  minio_data:

networks:
  karsaz-network:
    driver: bridge
```

### One-Click Setup Script
```bash
#!/bin/bash
# scripts/setup.sh

echo "🚀 Setting up Karsaz App..."

# Check prerequisites
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed"
        exit 1
    fi
    echo "✅ Docker is installed"
}

# Setup environment files
setup_env_files() {
    echo "📝 Setting up environment files..."
    
    if [ ! -f ".env.local" ]; then
        cp .env.example .env.local
        echo "✅ Created frontend .env.local"
    fi
    
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        echo "✅ Created backend .env"
    fi
    
    if [ ! -f "admin-panel/.env.local" ]; then
        cp admin-panel/.env.example admin-panel/.env.local
        echo "✅ Created admin panel .env.local"
    fi
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    npm install
    cd backend && npm install && cd ..
    cd admin-panel && npm install && cd ..
    echo "✅ Dependencies installed"
}

# Setup database
setup_database() {
    echo "🗄️ Setting up database..."
    
    # Start database services
    docker-compose up -d postgres redis minio
    sleep 10
    
    # Generate Prisma client and run migrations
    cd backend
    npx prisma generate
    npx prisma db push
    npm run db:seed
    cd ..
    
    echo "✅ Database setup completed"
}

# Start all services
start_services() {
    echo "🚀 Starting all services..."
    docker-compose up -d
    echo "✅ All services started"
}

# Main execution
main() {
    check_docker
    setup_env_files
    install_dependencies
    setup_database
    start_services
    
    echo ""
    echo "🎉 Karsaz App setup completed!"
    echo ""
    echo "📱 Service URLs:"
    echo "   Frontend:     http://localhost:12000"
    echo "   Admin Panel:  http://localhost:12001"
    echo "   Backend API:  http://localhost:3001"
    echo "   MinIO Console: http://localhost:9001"
    echo ""
}

main "$@"
```

### Production Deployment

#### Nginx Configuration
```nginx
# docker/nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }
    
    upstream admin {
        server admin:3000;
    }
    
    upstream backend {
        server backend:3001;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    server {
        listen 80;
        server_name your-domain.com;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
        
        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Admin Panel
        location /admin {
            proxy_pass http://admin;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # API
        location /api {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Auth endpoints with stricter rate limiting
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Socket.io
        location /socket.io/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

---

## ⚙️ Environment Configuration

### Development Environment
```bash
# .env.local (Frontend)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_MINIO_URL=http://localhost:9000
NEXT_PUBLIC_APP_NAME=کارساز
NEXT_PUBLIC_APP_VERSION=2.0.0

# backend/.env (Backend)
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://karsaz:karsaz_password_2024@localhost:5432/karsaz
REDIS_URL=redis://:redis_password_2024@localhost:6379
JWT_SECRET=karsaz_jwt_secret_very_long_and_secure_key_2024_development
JWT_REFRESH_SECRET=karsaz_jwt_refresh_secret_very_long_and_secure_key_2024_development
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:12000
ADMIN_URL=http://localhost:12001
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=karsaz_minio
MINIO_SECRET_KEY=karsaz_minio_password_2024
MINIO_BUCKET_NAME=karsaz-uploads
MINIO_USE_SSL=false
```

### Production Environment
```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL=postgresql://user:password@postgres:5432/karsaz
REDIS_URL=redis://:password@redis:6379
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key
FRONTEND_URL=https://your-domain.com
ADMIN_URL=https://admin.your-domain.com
MINIO_ENDPOINT=minio.your-domain.com
MINIO_USE_SSL=true
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
```

---

## 🚀 Quick Start Commands

### Development
```bash
# Clone repository
git clone https://github.com/karsaz-bot/Karsaz-app.git
cd Karsaz-app

# One-click setup
chmod +x scripts/setup.sh
./scripts/setup.sh

# Manual setup
npm install
cd backend && npm install && cd ..
cd admin-panel && npm install && cd ..

# Setup environment
cp .env.example .env.local
cp backend/.env.example backend/.env
cp admin-panel/.env.example admin-panel/.env.local

# Start services
docker-compose up -d postgres redis minio
cd backend && npx prisma generate && npx prisma db push && npm run db:seed && cd ..
npm run dev
```

### Production
```bash
# Build and deploy
docker-compose build
docker-compose up -d

# Or with custom environment
docker-compose -f docker-compose.prod.yml up -d
```

### Useful Commands
```bash
# Development
npm run dev                  # Start all services
npm run dev:frontend         # Frontend only
npm run dev:backend          # Backend only
npm run dev:admin           # Admin panel only

# Database
cd backend
npm run db:studio           # Prisma Studio
npm run db:seed             # Seed data
npm run db:reset            # Reset database

# Docker
docker-compose up -d        # Start all services
docker-compose down         # Stop all services
docker-compose logs -f      # View logs
docker-compose restart      # Restart services

# Build
npm run build               # Build all projects
npm run build:frontend      # Build frontend
npm run build:backend       # Build backend
npm run build:admin         # Build admin panel
```

---

## 📊 Monitoring & Analytics

### Health Checks
```typescript
// Backend health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    services: {
      database: 'connected',
      redis: 'connected',
      minio: 'connected'
    }
  })
})
```

### Prometheus Metrics
```typescript
// Backend metrics
import promClient from 'prom-client'

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
})

const activeConnections = new promClient.Gauge({
  name: 'websocket_active_connections',
  help: 'Number of active WebSocket connections'
})
```

---

## 🔒 Security Best Practices

### Backend Security
- JWT tokens با expiration کوتاه
- Refresh tokens در دیتابیس
- Rate limiting برای API endpoints
- Input validation با Zod
- Password hashing با Argon2
- CORS configuration
- Security headers
- SQL injection prevention
- XSS protection

### Frontend Security
- CSP headers
- Secure cookie settings
- Token storage در localStorage
- API request validation
- File upload restrictions
- Image optimization
- PWA security

---

## 📱 PWA Features

### Service Worker
```javascript
// public/sw.js
self.addEventListener('push', function(event) {
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'مشاهده',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'بستن',
        icon: '/icons/xmark.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('کارساز', options)
  )
})
```

### Push Notifications
```typescript
// Frontend push notification setup
export async function subscribeToPushNotifications() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    })
    
    // Send subscription to backend
    await ApiClient.post('/api/push/subscribe', {
      subscription: subscription.toJSON()
    })
  }
}
```

---

## 🎯 Performance Optimization

### Frontend Optimization
- Next.js Image optimization
- Code splitting
- Lazy loading
- Bundle analysis
- Caching strategies
- PWA caching
- CDN integration

### Backend Optimization
- Database indexing
- Query optimization
- Redis caching
- Connection pooling
- Compression
- Rate limiting
- Load balancing

---

## 🧪 Testing Strategy

### Backend Testing
```typescript
// tests/auth.test.ts
describe('Authentication', () => {
  test('should register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User'
      })
      .expect(201)
    
    expect(response.body.user.email).toBe('test@example.com')
    expect(response.body.tokens.accessToken).toBeDefined()
  })
})
```

### Frontend Testing
```typescript
// __tests__/LoginForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { LoginForm } from '@/components/forms/LoginForm'

test('should submit login form', async () => {
  render(<LoginForm />)
  
  fireEvent.change(screen.getByPlaceholderText('ایمیل'), {
    target: { value: 'test@example.com' }
  })
  
  fireEvent.change(screen.getByPlaceholderText('رمز عبور'), {
    target: { value: 'password123' }
  })
  
  fireEvent.click(screen.getByText('ورود'))
  
  // Assert login success
})
```

---

## 📚 Additional Resources

### Documentation Links
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.io Documentation](https://socket.io/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### API Testing
```bash
# Test API endpoints with curl
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

curl -X GET http://localhost:3001/api/ads \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎉 Conclusion

این مستندات شامل تمام جزئیات فنی، معماری، و راهنمای کامل برای توسعه Frontend مطابق با Backend موجود است. با استفاده از این راهنما، می‌توانید:

1. **Frontend کاملاً جدید** توسعه دهید
2. **PWA** با قابلیت‌های پیشرفته ایجاد کنید
3. **Real-time features** پیاده‌سازی کنید
4. **Authentication system** کامل داشته باشید
5. **File management** و upload پیاده‌سازی کنید
6. **Docker deployment** یکپارچه انجام دهید

تمام کدها، configurations، و scripts آماده استفاده هستند و با یک دستور قابل راه‌اندازی است.

**🚀 Ready to build the next generation of Karsaz App!**