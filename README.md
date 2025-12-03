# کارساز - Karsaz App

یک پلتفرم مدرن آگهی‌های رایگان ساخته شده با Node.js، Express، Next.js و PostgreSQL

## ویژگی‌ها

- 🔐 سیستم احراز هویت کامل با JWT
- 📱 طراحی ریسپانسیو با تم تیره/روشن
- 🔍 جستجوی پیشرفته و فیلترینگ
- 💬 سیستم پیام‌رسانی Real-time
- ❤️ علاقه‌مندی‌ها و نشان‌ها
- 📊 داشبورد کاربری و آنالیتیکس
- 🏷️ سازماندهی بر اساس دسته‌بندی
- 📸 آپلود و مدیریت تصاویر
- 🌍 خدمات مبتنی بر موقعیت
- ⭐ سیستم امتیازدهی و نظرات
- 🛡️ پنل ادمین جداگانه
- 🐳 Docker containerization کامل
- 📈 مانیتورینگ و لاگ‌گیری

## معماری فنی

### Backend
- **Framework**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT + Refresh Tokens
- **File Storage**: MinIO Object Storage
- **Real-time**: Socket.io
- **Search**: Elasticsearch (اختیاری)
- **Validation**: Zod
- **Security**: Argon2, Rate Limiting, CORS

### Frontend
- **Framework**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Admin Panel
- **Framework**: Next.js 15 + React 19 + TypeScript
- **UI Library**: Radix UI + Tailwind CSS
- **Charts**: Recharts
- **Tables**: TanStack Table

### DevOps
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Monitoring**: Prometheus + Grafana
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Object Storage**: MinIO

## شروع سریع

### پیش‌نیازها

- Node.js 18+
- Docker و Docker Compose
- Git

### نصب خودکار

```bash
# کلون کردن پروژه
git clone https://github.com/karsaz-bot/Karsaz-app.git
cd Karsaz-app

# اجرای اسکریپت نصب خودکار
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### نصب دستی

1. **کلون کردن پروژه:**
```bash
git clone https://github.com/karsaz-bot/Karsaz-app.git
cd Karsaz-app
```

2. **نصب dependencies:**
```bash
npm install
cd backend && npm install && cd ..
cd admin-panel && npm install && cd ..
```

3. **تنظیم environment variables:**
```bash
cp .env.example .env.local
cp backend/.env.example backend/.env
cp admin-panel/.env.example admin-panel/.env.local
```

4. **راه‌اندازی دیتابیس:**
```bash
docker-compose up -d postgres redis minio
cd backend
npx prisma generate
npx prisma db push
npm run db:seed
cd ..
```

5. **اجرای سرویس‌ها:**
```bash
# Development mode
npm run dev

# یا با Docker
docker-compose up -d
```

## URL های سرویس‌ها

- **Frontend**: http://localhost:12000
- **Admin Panel**: http://localhost:12001  
- **Backend API**: http://localhost:3001
- **MinIO Console**: http://localhost:9001
- **Grafana**: http://localhost:3000
- **Prometheus**: http://localhost:9090

## ساختار پروژه

```
karsaz-app/
├── src/                     # Frontend Next.js
│   ├── app/                 # App Router
│   ├── components/          # کامپوننت‌های قابل استفاده مجدد
│   ├── lib/                 # توابع کمکی
│   ├── stores/              # Zustand stores
│   └── types/               # TypeScript types
├── backend/                 # Backend Node.js
│   ├── src/
│   │   ├── config/          # تنظیمات
│   │   ├── controllers/     # کنترلرها
│   │   ├── middleware/      # میدل‌ویرها
│   │   ├── routes/          # مسیرها
│   │   ├── services/        # سرویس‌ها
│   │   └── utils/           # ابزارها
│   ├── prisma/              # Prisma schema
│   └── uploads/             # فایل‌های آپلود شده
├── admin-panel/             # پنل ادمین Next.js
│   ├── src/
│   │   ├── app/             # App Router
│   │   ├── components/      # کامپوننت‌های ادمین
│   │   └── lib/             # توابع کمکی
├── docker/                  # تنظیمات Docker
├── scripts/                 # اسکریپت‌های کمکی
└── docker-compose.yml       # Docker Compose
```

## دستورات مفید

```bash
# توسعه
npm run dev                  # اجرای تمام سرویس‌ها
npm run dev:frontend         # فقط Frontend
npm run dev:backend          # فقط Backend
npm run dev:admin            # فقط Admin Panel

# دیتابیس
cd backend
npm run db:studio            # Prisma Studio
npm run db:seed              # Seed کردن دیتا
npm run db:reset             # ریست دیتابیس

# Docker
docker-compose up -d         # اجرای تمام سرویس‌ها
docker-compose down          # متوقف کردن سرویس‌ها
docker-compose logs -f       # مشاهده لاگ‌ها
docker-compose restart       # ری‌استارت سرویس‌ها

# Build
npm run build                # Build تمام پروژه‌ها
npm run build:frontend       # Build Frontend
npm run build:backend        # Build Backend
npm run build:admin          # Build Admin Panel
```

## API Documentation

Backend API endpoints:

- **Auth**: `/api/auth/*` - احراز هویت
- **Users**: `/api/users/*` - مدیریت کاربران
- **Ads**: `/api/ads/*` - مدیریت آگهی‌ها
- **Categories**: `/api/categories/*` - دسته‌بندی‌ها
- **Messages**: `/api/messages/*` - پیام‌ها
- **Search**: `/api/search/*` - جستجو
- **Upload**: `/api/uploads/*` - آپلود فایل
- **Admin**: `/api/admin/*` - پنل ادمین

## امنیت

- JWT Authentication با Refresh Tokens
- Password hashing با Argon2
- Rate limiting
- Input validation با Zod
- CORS protection
- SQL injection prevention
- XSS protection

## مانیتورینگ

- **Prometheus**: جمع‌آوری metrics
- **Grafana**: نمایش داشبوردها
- **Winston**: لاگ‌گیری
- **Health checks**: بررسی سلامت سرویس‌ها

## مشارکت

1. Fork کردن پروژه
2. ایجاد branch جدید
3. اعمال تغییرات
4. ارسال Pull Request

## لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

## پشتیبانی

برای گزارش باگ یا درخواست ویژگی جدید، لطفاً از GitHub Issues استفاده کنید.

---

**ساخته شده با ❤️ برای جامعه ایرانی**