# 📚 مستندات کامل Backend - کارساز (Karsaz)

> **این مستندات برای Frontend Developer طراحی شده است تا بتواند Frontend کاملی متناسب با این Backend ایجاد کند**

## 🎯 خلاصه اجرایی

کارساز یک پلتفرم آگهی‌های رایگان مدرن است که با معماری Microservices و تکنولوژی‌های پیشرفته ساخته شده است. این Backend قابلیت‌های کاملی برای ایجاد یک PWA پیشرفته فراهم می‌کند.

---

## 🏗️ معماری کلی سیستم

### Stack تکنولوژی:
- **Runtime**: Node.js 20+
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL 16 + Prisma ORM
- **Cache**: Redis 7
- **Authentication**: JWT + Refresh Tokens
- **Real-time**: Socket.io
- **File Storage**: MinIO Object Storage
- **Search**: Elasticsearch 8.11
- **Monitoring**: Prometheus + Grafana
- **Containerization**: Docker + Docker Compose

### پورت‌های سرویس‌ها:
```
Backend API:     3001
PostgreSQL:      5432
Redis:           6379
MinIO:           9000 (API) / 9001 (Console)
Elasticsearch:   9200
Prometheus:      9090
Grafana:         3000
```

---

## 🗄️ طراحی دیتابیس (Prisma Schema)

### Models اصلی:

#### 1. User Model
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
  isVerified            Boolean   @default(false)
  isPremium             Boolean   @default(false)
  role                  UserRole  @default(USER)
  subscriptionType      SubscriptionType @default(FREE)
  subscriptionExpiresAt DateTime?
  settings              Json?
  socialLinks           Json?
  rating                Float?    @default(0)
  totalRatings          Int       @default(0)
  lastSeenAt            DateTime?
  emailVerified         DateTime?
  deletedAt             DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  // Relations
  ads                   Ad[]
  sentMessages          Message[] @relation("SentMessages")
  receivedMessages      Message[] @relation("ReceivedMessages")
  buyerConversations    Conversation[] @relation("BuyerConversations")
  sellerConversations   Conversation[] @relation("SellerConversations")
  favorites             Favorite[]
  reviews               Review[]
  givenReviews          Review[] @relation("ReviewGiver")
  refreshTokens         RefreshToken[]
  notifications         Notification[]
  reports               Report[]
  reportedBy            Report[] @relation("ReportedBy")
}
```

#### 2. Ad Model
```prisma
model Ad {
  id              String      @id @default(cuid())
  title           String
  description     String
  price           Decimal
  images          String[]
  condition       Condition
  status          AdStatus    @default(ACTIVE)
  location        String
  coordinates     Json?
  categoryId      String
  userId          String
  views           Int         @default(0)
  isPromoted      Boolean     @default(false)
  promotedUntil   DateTime?
  tags            String[]
  specifications  Json?
  contactInfo     Json?
  deliveryOptions String[]
  paymentMethods  String[]
  negotiable      Boolean     @default(true)
  urgent          Boolean     @default(false)
  featuredUntil   DateTime?
  deletedAt       DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relations
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  category        Category    @relation(fields: [categoryId], references: [id])
  messages        Message[]
  conversations   Conversation[]
  favorites       Favorite[]
  reviews         Review[]
  reports         Report[]
}
```

#### 3. Category Model
```prisma
model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  icon        String?
  image       String?
  parentId    String?
  isActive    Boolean    @default(true)
  sortOrder   Int        @default(0)
  metadata    Json?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // Relations
  parent      Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  ads         Ad[]
}
```

#### 4. Message & Conversation Models
```prisma
model Conversation {
  id                  String    @id @default(cuid())
  adId                String
  buyerId             String
  sellerId            String
  lastMessageId       String?
  lastMessageAt       DateTime?
  unreadCountBuyer    Int       @default(0)
  unreadCountSeller   Int       @default(0)
  isBlockedByBuyer    Boolean   @default(false)
  isBlockedBySeller   Boolean   @default(false)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // Relations
  ad                  Ad        @relation(fields: [adId], references: [id], onDelete: Cascade)
  buyer               User      @relation("BuyerConversations", fields: [buyerId], references: [id])
  seller              User      @relation("SellerConversations", fields: [sellerId], references: [id])
  messages            Message[]
  lastMessage         Message?  @relation("LastMessage", fields: [lastMessageId], references: [id])
}

model Message {
  id             String        @id @default(cuid())
  conversationId String
  adId           String
  senderId       String
  receiverId     String
  content        String
  messageType    MessageType   @default(TEXT)
  attachments    Json?
  isRead         Boolean       @default(false)
  readAt         DateTime?
  isEdited       Boolean       @default(false)
  editedAt       DateTime?
  deletedAt      DateTime?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  // Relations
  conversation   Conversation  @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  ad             Ad            @relation(fields: [adId], references: [id], onDelete: Cascade)
  sender         User          @relation("SentMessages", fields: [senderId], references: [id])
  receiver       User          @relation("ReceivedMessages", fields: [receiverId], references: [id])
  lastMessageOf  Conversation[] @relation("LastMessage")
}
```

### Enums:
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
  FILE
  LOCATION
  CONTACT
  SYSTEM
}
```

---

## 🔐 سیستم احراز هویت (Authentication)

### JWT Token Structure:
```typescript
interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  iat: number
  exp: number
}

interface RefreshTokenPayload {
  userId: string
  tokenId: string
  iat: number
  exp: number
}
```

### Authentication Flow:
1. **Register/Login** → Access Token (15min) + Refresh Token (7 days)
2. **Token Refresh** → New Access Token + New Refresh Token
3. **Logout** → Invalidate specific Refresh Token
4. **Logout All** → Invalidate all user's Refresh Tokens

### Headers Required:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 🌐 API Endpoints کامل

### Base URL: `http://localhost:3001/api`

## 🔑 Authentication Endpoints

### POST `/auth/register`
```typescript
// Request Body
interface RegisterRequest {
  email: string
  password: string // Min 8 chars, must contain: uppercase, lowercase, number, special char
  fullName?: string
  phone?: string // Iranian format: +989xxxxxxxxx or 09xxxxxxxxx
}

// Response
interface RegisterResponse {
  message: string
  user: {
    id: string
    email: string
    fullName: string | null
    phone: string | null
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

// Example Request
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "علی احمدی",
  "phone": "09123456789"
}
```

### POST `/auth/login`
```typescript
// Request Body
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

### POST `/auth/refresh`
```typescript
// Request Body
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

### POST `/auth/logout`
```typescript
// Headers: Authorization: Bearer <token>
// Request Body (optional)
interface LogoutRequest {
  refreshToken?: string
}

// Response
interface LogoutResponse {
  message: string
}
```

### GET `/auth/me`
```typescript
// Headers: Authorization: Bearer <token>
// Response
interface CurrentUserResponse {
  user: {
    id: string
    email: string
    fullName: string | null
    avatarUrl: string | null
    phone: string | null
    phoneVerified: string | null
    location: string | null
    bio: string | null
    isVerified: boolean
    isPremium: boolean
    role: string
    subscriptionType: string
    subscriptionExpiresAt: string | null
    settings: any
    socialLinks: any
    rating: number | null
    totalRatings: number
    createdAt: string
    updatedAt: string
  }
}
```

### PATCH `/auth/profile`
```typescript
// Headers: Authorization: Bearer <token>
// Request Body
interface UpdateProfileRequest {
  fullName?: string
  phone?: string
  location?: string
  bio?: string
  settings?: any
  socialLinks?: any
}

// Response
interface UpdateProfileResponse {
  message: string
  user: UserProfile
}
```

### POST `/auth/verify-email`
```typescript
// Request Body
interface VerifyEmailRequest {
  token: string // JWT token from email
}

// Response
interface VerifyEmailResponse {
  message: string
  user: {
    id: string
    email: string
    isVerified: boolean
  }
}
```

### POST `/auth/forgot-password`
```typescript
// Request Body
interface ForgotPasswordRequest {
  email: string
}

// Response
interface ForgotPasswordResponse {
  message: string // Always same message for security
}
```

### POST `/auth/reset-password`
```typescript
// Request Body
interface ResetPasswordRequest {
  token: string // JWT token from email
  password: string
}

// Response
interface ResetPasswordResponse {
  message: string
}
```

---

## 📱 Ads Management Endpoints

### GET `/ads`
```typescript
// Query Parameters
interface AdsQuery {
  page?: number // Default: 1
  limit?: number // Default: 20, Max: 100
  category?: string // Category ID
  location?: string
  priceMin?: number
  priceMax?: number
  condition?: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR'
  sortBy?: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'popular'
  search?: string
  userId?: string // Filter by user
  status?: 'ACTIVE' | 'SOLD' | 'EXPIRED'
}

// Response
interface AdsResponse {
  data: Ad[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface Ad {
  id: string
  title: string
  description: string
  price: string // Decimal as string
  images: string[]
  condition: string
  status: string
  location: string
  coordinates: any
  views: number
  isPromoted: boolean
  promotedUntil: string | null
  tags: string[]
  specifications: any
  contactInfo: any
  deliveryOptions: string[]
  paymentMethods: string[]
  negotiable: boolean
  urgent: boolean
  featuredUntil: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    fullName: string | null
    avatarUrl: string | null
    rating: number | null
    totalRatings: number
  }
  category: {
    id: string
    name: string
    slug: string
    icon: string | null
  }
  _count: {
    favorites: number
    reviews: number
  }
}
```

### GET `/ads/:id`
```typescript
// Response
interface AdDetailResponse {
  ad: Ad & {
    user: {
      id: string
      fullName: string | null
      avatarUrl: string | null
      rating: number | null
      totalRatings: number
      lastSeenAt: string | null
      createdAt: string
    }
    category: {
      id: string
      name: string
      slug: string
      description: string | null
      icon: string | null
      parent: {
        id: string
        name: string
        slug: string
      } | null
    }
    reviews: Review[]
    relatedAds: Ad[]
  }
}
```

### POST `/ads`
```typescript
// Headers: Authorization: Bearer <token>
// Request Body
interface CreateAdRequest {
  title: string // Max 200 chars
  description: string // Max 5000 chars
  price: number
  images: string[] // Max 10 images
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR'
  location: string
  coordinates?: {
    lat: number
    lng: number
  }
  categoryId: string
  tags?: string[] // Max 10 tags
  specifications?: any
  contactInfo?: {
    phone?: string
    email?: string
    whatsapp?: string
  }
  deliveryOptions?: string[]
  paymentMethods?: string[]
  negotiable?: boolean
  urgent?: boolean
}

// Response
interface CreateAdResponse {
  message: string
  ad: Ad
}
```

### PATCH `/ads/:id`
```typescript
// Headers: Authorization: Bearer <token>
// Request Body: Same as CreateAdRequest but all fields optional
// Response: Same as CreateAdResponse
```

### DELETE `/ads/:id`
```typescript
// Headers: Authorization: Bearer <token>
// Response
interface DeleteAdResponse {
  message: string
}
```

### POST `/ads/:id/view`
```typescript
// Increment view count (can be called without auth)
// Response
interface IncrementViewResponse {
  message: string
  views: number
}
```

---

## 🔍 Search & Categories

### GET `/search`
```typescript
// Query Parameters
interface SearchQuery {
  q?: string // Search query
  category?: string
  location?: string
  priceMin?: number
  priceMax?: number
  condition?: string
  sortBy?: string
  page?: number
  limit?: number
}

// Response: Same as AdsResponse
```

### GET `/search/suggestions`
```typescript
// Query Parameters
interface SuggestionsQuery {
  q: string // Minimum 2 characters
}

// Response
interface SuggestionsResponse {
  suggestions: string[]
}
```

### GET `/categories`
```typescript
// Response
interface CategoriesResponse {
  categories: Category[]
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  image: string | null
  parentId: string | null
  isActive: boolean
  sortOrder: number
  metadata: any
  children: Category[]
  _count: {
    ads: number
  }
}
```

### GET `/categories/:id`
```typescript
// Response
interface CategoryDetailResponse {
  category: Category & {
    parent: Category | null
    children: Category[]
    ads: Ad[] // Recent ads in this category
  }
}
```

---

## 💬 Messaging System

### GET `/messages/conversations`
```typescript
// Headers: Authorization: Bearer <token>
// Query Parameters
interface ConversationsQuery {
  page?: number
  limit?: number
}

// Response
interface ConversationsResponse {
  data: Conversation[]
  pagination: PaginationInfo
}

interface Conversation {
  id: string
  adId: string
  buyerId: string
  sellerId: string
  lastMessageAt: string | null
  unreadCountBuyer: number
  unreadCountSeller: number
  isBlockedByBuyer: boolean
  isBlockedBySeller: boolean
  createdAt: string
  updatedAt: string
  ad: {
    id: string
    title: string
    price: string
    images: string[]
    status: string
  }
  buyer: {
    id: string
    fullName: string | null
    avatarUrl: string | null
  }
  seller: {
    id: string
    fullName: string | null
    avatarUrl: string | null
  }
  lastMessage: {
    id: string
    content: string
    messageType: string
    createdAt: string
    sender: {
      id: string
      fullName: string | null
    }
  } | null
}
```

### GET `/messages/conversations/:id`
```typescript
// Headers: Authorization: Bearer <token>
// Response
interface ConversationDetailResponse {
  conversation: Conversation
}
```

### GET `/messages/conversations/:id/messages`
```typescript
// Headers: Authorization: Bearer <token>
// Query Parameters
interface MessagesQuery {
  page?: number
  limit?: number
  before?: string // Message ID for pagination
}

// Response
interface MessagesResponse {
  data: Message[]
  pagination: PaginationInfo
}

interface Message {
  id: string
  conversationId: string
  adId: string
  senderId: string
  receiverId: string
  content: string
  messageType: string
  attachments: any
  isRead: boolean
  readAt: string | null
  isEdited: boolean
  editedAt: string | null
  createdAt: string
  updatedAt: string
  sender: {
    id: string
    fullName: string | null
    avatarUrl: string | null
  }
}
```

### POST `/messages/conversations/:id/messages`
```typescript
// Headers: Authorization: Bearer <token>
// Request Body
interface SendMessageRequest {
  content: string
  messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'LOCATION' | 'CONTACT'
  attachments?: any[]
}

// Response
interface SendMessageResponse {
  message: string
  data: Message
}
```

### PATCH `/messages/conversations/:id/read`
```typescript
// Headers: Authorization: Bearer <token>
// Request Body
interface MarkReadRequest {
  messageIds?: string[] // If not provided, marks all as read
}

// Response
interface MarkReadResponse {
  message: string
  markedCount: number
}
```

---

## ❤️ Favorites System

### GET `/users/favorites`
```typescript
// Headers: Authorization: Bearer <token>
// Query Parameters: Same as AdsQuery
// Response: Same as AdsResponse
```

### POST `/users/favorites/:adId`
```typescript
// Headers: Authorization: Bearer <token>
// Response
interface AddFavoriteResponse {
  message: string
  favorite: {
    id: string
    userId: string
    adId: string
    createdAt: string
  }
}
```

### DELETE `/users/favorites/:adId`
```typescript
// Headers: Authorization: Bearer <token>
// Response
interface RemoveFavoriteResponse {
  message: string
}
```

---

## 📤 File Upload System

### POST `/uploads`
```typescript
// Headers: Authorization: Bearer <token>
// Content-Type: multipart/form-data
// Form Data:
// - file: File (Max 10MB)
// - type: 'image' | 'document' (optional, default: 'image')

// Response
interface UploadResponse {
  message: string
  file: {
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
    thumbnailUrl?: string // For images
    createdAt: string
  }
}
```

### POST `/uploads/multiple`
```typescript
// Headers: Authorization: Bearer <token>
// Content-Type: multipart/form-data
// Form Data:
// - files: File[] (Max 10 files, 10MB each)
// - type: 'image' | 'document' (optional)

// Response
interface MultipleUploadResponse {
  message: string
  files: UploadedFile[]
  failed: {
    filename: string
    error: string
  }[]
}
```

---

## 🛡️ Admin Panel Endpoints

### GET `/admin/stats`
```typescript
// Headers: Authorization: Bearer <admin_token>
// Response
interface AdminStatsResponse {
  users: {
    total: number
    active: number
    verified: number
    premium: number
    newThisMonth: number
  }
  ads: {
    total: number
    active: number
    sold: number
    expired: number
    newThisMonth: number
  }
  messages: {
    total: number
    newThisMonth: number
  }
  revenue: {
    thisMonth: number
    lastMonth: number
    total: number
  }
  topCategories: {
    id: string
    name: string
    adsCount: number
  }[]
}
```

### GET `/admin/users`
```typescript
// Headers: Authorization: Bearer <admin_token>
// Query Parameters
interface AdminUsersQuery {
  page?: number
  limit?: number
  search?: string
  role?: 'USER' | 'MODERATOR' | 'ADMIN'
  status?: 'active' | 'suspended' | 'deleted'
  verified?: boolean
  premium?: boolean
  sortBy?: 'newest' | 'oldest' | 'name' | 'email'
}

// Response
interface AdminUsersResponse {
  data: AdminUser[]
  pagination: PaginationInfo
}

interface AdminUser {
  id: string
  email: string
  fullName: string | null
  phone: string | null
  isVerified: boolean
  isPremium: boolean
  role: string
  lastSeenAt: string | null
  createdAt: string
  _count: {
    ads: number
    sentMessages: number
    favorites: number
  }
}
```

### PATCH `/admin/users/:id/status`
```typescript
// Headers: Authorization: Bearer <admin_token>
// Request Body
interface UpdateUserStatusRequest {
  action: 'suspend' | 'activate' | 'verify' | 'unverify' | 'promote' | 'demote'
  reason?: string
}

// Response
interface UpdateUserStatusResponse {
  message: string
  user: AdminUser
}
```

---

## 🔄 Real-time Events (Socket.io)

### Connection:
```typescript
// Client connection
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your_jwt_token'
  }
})
```

### Events to Listen:

#### `new_message`
```typescript
interface NewMessageEvent {
  message: Message
  conversationId: string
}
```

#### `message_notification`
```typescript
interface MessageNotificationEvent {
  conversationId: string
  message: {
    id: string
    content: string
    sender: {
      id: string
      fullName: string | null
    }
    createdAt: string
  }
  ad: {
    id: string
    title: string
  }
}
```

#### `messages_read`
```typescript
interface MessagesReadEvent {
  conversationId: string
  readBy: string
  messageIds?: string[]
}
```

#### `user_typing` / `user_stopped_typing`
```typescript
interface TypingEvent {
  userId: string
  conversationId: string
}
```

### Events to Emit:

#### `join_conversation`
```typescript
socket.emit('join_conversation', conversationId)
```

#### `send_message`
```typescript
socket.emit('send_message', {
  conversationId: string
  content: string
  messageType?: string
  attachments?: any[]
})
```

#### `mark_messages_read`
```typescript
socket.emit('mark_messages_read', {
  conversationId: string
  messageIds?: string[]
})
```

#### `typing_start` / `typing_stop`
```typescript
socket.emit('typing_start', { conversationId: string })
socket.emit('typing_stop', { conversationId: string })
```

---

## 🚨 Error Handling

### Error Response Format:
```typescript
interface ErrorResponse {
  error: string
  message: string
  statusCode: number
  timestamp: string
  path: string
  details?: any // Only in development
}
```

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Invalid/expired token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `409` - Conflict (Duplicate data)
- `422` - Unprocessable Entity
- `429` - Too Many Requests (Rate limited)
- `500` - Internal Server Error

### Validation Errors:
```typescript
interface ValidationError {
  field: string
  message: string
  code: string
}
```

---

## 🔒 Security & Rate Limiting

### Rate Limits:
- **General API**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP
- **Upload endpoints**: 10 requests per hour per user
- **Search endpoints**: 60 requests per minute per IP

### Security Headers:
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 📊 Monitoring & Health Check

### GET `/health`
```typescript
// Response
interface HealthResponse {
  status: 'ok' | 'error'
  timestamp: string
  uptime: number
  services: {
    database: 'connected' | 'disconnected'
    redis: 'connected' | 'disconnected'
    minio: 'connected' | 'disconnected'
    elasticsearch: 'connected' | 'disconnected'
  }
  version: string
}
```

### GET `/metrics`
```typescript
// Prometheus metrics format
// Includes: HTTP requests, response times, database queries, etc.
```

---

## 🌍 Environment Variables

### Required Environment Variables:
```bash
# Application
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Redis
REDIS_URL=redis://user:pass@host:port

# JWT
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# URLs
FRONTEND_URL=http://localhost:12000
ADMIN_URL=http://localhost:12001

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=access-key
MINIO_SECRET_KEY=secret-key
MINIO_BUCKET_NAME=karsaz-uploads
MINIO_USE_SSL=false

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@karsaz.com

# Optional
ELASTICSEARCH_URL=http://localhost:9200
SENTRY_DSN=your-sentry-dsn
```

---

## 🚀 Deployment & Docker

### Docker Compose Services:
```yaml
services:
  - postgres (Database)
  - redis (Cache)
  - minio (Object Storage)
  - elasticsearch (Search)
  - backend (API Server)
  - nginx (Reverse Proxy)
  - prometheus (Monitoring)
  - grafana (Dashboard)
```

### One-Command Setup:
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Manual Docker Commands:
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Restart service
docker-compose restart backend

# Stop all services
docker-compose down
```

---

## 📱 PWA Requirements for Frontend

### Service Worker Features Needed:
1. **Offline Support**: Cache API responses and static assets
2. **Push Notifications**: New messages, ad updates, etc.
3. **Background Sync**: Queue actions when offline
4. **Install Prompt**: Add to home screen functionality

### Recommended Frontend Architecture:
```
src/
├── app/                 # Next.js App Router
├── components/          # Reusable UI components
├── lib/                 # Utilities and configurations
├── stores/              # State management (Zustand)
├── hooks/               # Custom React hooks
├── services/            # API services and Socket.io
├── types/               # TypeScript type definitions
└── styles/              # Global styles and themes
```

### Key Frontend Features to Implement:
1. **Authentication Flow**: Login, register, profile management
2. **Ad Management**: Create, edit, view, search ads
3. **Real-time Chat**: Socket.io integration for messaging
4. **File Upload**: Image and document upload with preview
5. **Search & Filters**: Advanced search with multiple filters
6. **Favorites**: Save and manage favorite ads
7. **Notifications**: Real-time and push notifications
8. **Dark/Light Theme**: Theme switching capability
9. **Responsive Design**: Mobile-first approach
10. **PWA Features**: Offline support, install prompt

### Recommended UI Libraries:
- **Styling**: Tailwind CSS + Radix UI
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand for global state
- **HTTP**: Axios with interceptors
- **Real-time**: Socket.io-client
- **Icons**: Lucide React
- **Charts**: Recharts (for admin panel)

---

## 🎯 Frontend Development Prompt

**برای توسعه‌دهنده Frontend:**

شما باید یک PWA کامل برای پلتفرم آگهی‌های کارساز بسازید که شامل موارد زیر باشد:

1. **صفحات اصلی**: خانه، جستجو، دسته‌بندی‌ها، جزئیات آگهی
2. **احراز هویت**: ثبت‌نام، ورود، پروفایل، تأیید ایمیل/موبایل
3. **مدیریت آگهی**: ایجاد، ویرایش، حذف، مشاهده آگهی‌ها
4. **پیام‌رسانی**: چت Real-time با Socket.io
5. **علاقه‌مندی‌ها**: ذخیره و مدیریت آگهی‌های مورد علاقه
6. **جستجوی پیشرفته**: فیلترهای متعدد و جستجوی هوشمند
7. **آپلود فایل**: تصاویر و اسناد با پیش‌نمایش
8. **اعلان‌ها**: Real-time و Push notifications
9. **تم تیره/روشن**: قابلیت تغییر تم
10. **PWA**: Offline support، Install prompt، Service Worker

**API Base URL**: `http://localhost:3001/api`
**Socket URL**: `http://localhost:3001`
**Authentication**: JWT Bearer Token

تمام endpoint ها، data structure ها، و real-time events در بالا مستند شده‌اند. از TypeScript استفاده کنید و کد را modular و maintainable بنویسید.

---

## 📞 پشتیبانی

برای سوالات فنی یا مشکلات، لطفاً به مستندات مراجعه کنید یا Issue ایجاد کنید.

**نسخه مستندات**: 2.0.0  
**آخرین بروزرسانی**: دسامبر 2024

---

*این مستندات برای توسعه‌دهندگان Frontend طراحی شده تا بتوانند یک رابط کاربری کامل و حرفه‌ای برای پلتفرم کارساز ایجاد کنند.*