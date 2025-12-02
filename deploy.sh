#!/bin/bash

# ============================================
# اسکریپت نصب و راه‌اندازی کامل برای سرور
# ============================================

set -e

echo "🚀 شروع نصب و راه‌اندازی کارساز روی سرور..."
echo ""

# رنگ‌ها برای خروجی
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# بررسی وجود Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js نصب نیست. لطفاً ابتدا Node.js را نصب کنید.${NC}"
    echo "   دستور نصب: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ نیاز به Node.js نسخه ۱۸ یا بالاتر است.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js پیدا شد: $(node -v)${NC}"

# بررسی وجود npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm نصب نیست.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm پیدا شد: $(npm -v)${NC}"
echo ""

# نصب dependencies
echo -e "${YELLOW}📦 در حال نصب dependencies...${NC}"
npm ci --production=false
echo -e "${GREEN}✅ dependencies نصب شدند${NC}"
echo ""

# بررسی فایل .env.local
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}📝 ایجاد فایل .env.local...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✅ فایل .env.local از .env.example ایجاد شد${NC}"
        echo -e "${YELLOW}⚠️  لطفاً فایل .env.local را با اطلاعات Supabase خود ویرایش کنید${NC}"
    else
        cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Next.js Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
EOF
        echo -e "${GREEN}✅ فایل .env.local ایجاد شد${NC}"
        echo -e "${YELLOW}⚠️  لطفاً فایل .env.local را با اطلاعات Supabase خود ویرایش کنید${NC}"
    fi
else
    echo -e "${GREEN}✅ فایل .env.local موجود است${NC}"
fi
echo ""

# ساخت پروژه
echo -e "${YELLOW}🏗️  در حال ساخت پروژه...${NC}"
npm run build
echo -e "${GREEN}✅ پروژه ساخته شد${NC}"
echo ""

# بررسی وجود PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 در حال نصب PM2...${NC}"
    npm install -g pm2
    echo -e "${GREEN}✅ PM2 نصب شد${NC}"
else
    echo -e "${GREEN}✅ PM2 پیدا شد${NC}"
fi
echo ""

# ایجاد فایل PM2 ecosystem
echo -e "${YELLOW}📝 ایجاد فایل PM2 ecosystem...${NC}"
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'karsaz',
    script: 'npm',
    args: 'start',
    cwd: process.cwd(),
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF
echo -e "${GREEN}✅ فایل ecosystem.config.js ایجاد شد${NC}"
echo ""

# راهنمای اجرا
echo -e "${GREEN}🎉 نصب با موفقیت انجام شد!${NC}"
echo ""
echo -e "${YELLOW}📝 دستورات مفید:${NC}"
echo "  - اجرای پروژه با PM2: ${GREEN}pm2 start ecosystem.config.js${NC}"
echo "  - مشاهده لاگ‌ها: ${GREEN}pm2 logs karsaz${NC}"
echo "  - توقف پروژه: ${GREEN}pm2 stop karsaz${NC}"
echo "  - راه‌اندازی مجدد: ${GREEN}pm2 restart karsaz${NC}"
echo "  - حذف از PM2: ${GREEN}pm2 delete karsaz${NC}"
echo ""
echo -e "${YELLOW}⚠️  نکات مهم:${NC}"
echo "  1. مطمئن شوید فایل .env.local را با اطلاعات Supabase خود ویرایش کرده‌اید"
echo "  2. برای استفاده از HTTPS، از Nginx یا Apache به عنوان reverse proxy استفاده کنید"
echo "  3. برای بهینه‌سازی بیشتر، از CDN برای فایل‌های استاتیک استفاده کنید"
echo ""

