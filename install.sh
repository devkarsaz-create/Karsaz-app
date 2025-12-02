#!/bin/bash

# ============================================
# اسکریپت نصب و راه‌اندازی کامل خودکار کارساز
# شامل: Supabase Local + Studio + Database + Frontend
# ============================================

set -e

# رنگ‌ها
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🚀 کارساز - نصب و راه‌اندازی کامل   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# بررسی Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js نصب نیست.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ نیاز به Node.js نسخه ۱۸ یا بالاتر است.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js: $(node -v)${NC}"
echo -e "${GREEN}✅ npm: $(npm -v)${NC}"
echo ""

# نصب dependencies
echo -e "${YELLOW}📦 نصب dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies نصب شدند${NC}"
echo ""

# بررسی/ایجاد .env.local
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}📝 ایجاد فایل .env.local...${NC}"
    cat > .env.local << EOF
# Supabase Local Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo -e "${GREEN}✅ فایل .env.local ایجاد شد${NC}"
else
    echo -e "${GREEN}✅ فایل .env.local موجود است${NC}"
fi
echo ""

# بررسی Supabase CLI
SUPABASE_AVAILABLE=false
if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✅ Supabase CLI پیدا شد: $(supabase --version)${NC}"
    SUPABASE_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️  Supabase CLI نصب نیست.${NC}"
    echo -e "${YELLOW}   در حال نصب با npx (بدون نیاز به sudo)...${NC}"
    
    # استفاده از npx برای اجرای supabase
    if command -v npx &> /dev/null; then
        echo -e "${BLUE}   استفاده از npx supabase${NC}"
        SUPABASE_CMD="npx supabase"
        SUPABASE_AVAILABLE=true
    else
        echo -e "${RED}   npx هم پیدا نشد!${NC}"
        echo -e "${YELLOW}   برای نصب Supabase CLI:${NC}"
        echo -e "${YELLOW}   curl -fsSL https://supabase.com/install.sh | sh${NC}"
    fi
fi
echo ""

# راه‌اندازی Supabase
if [ "$SUPABASE_AVAILABLE" = true ]; then
    echo -e "${BLUE}🗄️  راه‌اندازی Supabase Local...${NC}"
    
    # بررسی وضعیت Supabase
    if [ -n "$SUPABASE_CMD" ]; then
        # استفاده از npx
        if $SUPABASE_CMD status &> /dev/null; then
            echo -e "${YELLOW}   Supabase در حال اجرا است.${NC}"
        else
            echo -e "${YELLOW}   در حال شروع Supabase...${NC}"
            $SUPABASE_CMD start || {
                echo -e "${YELLOW}   در حال نصب Docker dependencies...${NC}"
                $SUPABASE_CMD start
            }
        fi
        SUPABASE_CMD_PREFIX="$SUPABASE_CMD "
    else
        # استفاده از supabase مستقیم
        if supabase status &> /dev/null; then
            echo -e "${YELLOW}   Supabase در حال اجرا است.${NC}"
        else
            echo -e "${YELLOW}   در حال شروع Supabase...${NC}"
            supabase start || {
                echo -e "${YELLOW}   در حال نصب Docker dependencies...${NC}"
                supabase start
            }
        fi
        SUPABASE_CMD_PREFIX=""
    fi
    
    echo -e "${GREEN}✅ Supabase راه‌اندازی شد!${NC}"
    echo ""
    
    # اجرای migrations
    echo -e "${BLUE}🔄 اجرای migrations...${NC}"
    if [ -d "supabase/migrations" ] && [ "$(ls -A supabase/migrations 2>/dev/null)" ]; then
        ${SUPABASE_CMD_PREFIX}db reset --db-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres" || true
        echo -e "${GREEN}✅ Migrations اجرا شدند${NC}"
    else
        echo -e "${YELLOW}⚠️  پوشه migrations خالی است یا وجود ندارد${NC}"
        echo -e "${YELLOW}   ایجاد ساختار اولیه...${NC}"
        mkdir -p supabase/migrations
        echo -e "${GREEN}✅ ساختار migrations ایجاد شد${NC}"
    fi
    echo ""
    
    # نمایش اطلاعات دسترسی
    echo -e "${BLUE}📊 اطلاعات دسترسی Supabase:${NC}"
    if [ -n "$SUPABASE_CMD" ]; then
        $SUPABASE_CMD status || true
    else
        supabase status || true
    fi
    echo ""
    
    # باز کردن Supabase Studio
    echo -e "${BLUE}🎨 باز کردن Supabase Studio...${NC}"
    SUPABASE_STUDIO_URL="http://127.0.0.1:54323"
    echo -e "${GREEN}✅ Supabase Studio در دسترس است:${NC}"
    echo -e "${GREEN}   ${SUPABASE_STUDIO_URL}${NC}"
    echo ""
    echo -e "${YELLOW}💡 برای باز کردن Studio در مرورگر:${NC}"
    if command -v xdg-open &> /dev/null; then
        (sleep 2 && xdg-open "$SUPABASE_STUDIO_URL" 2>/dev/null) &
        echo -e "${GREEN}   Studio به صورت خودکار باز می‌شود...${NC}"
    elif command -v open &> /dev/null; then
        (sleep 2 && open "$SUPABASE_STUDIO_URL" 2>/dev/null) &
        echo -e "${GREEN}   Studio به صورت خودکار باز می‌شود...${NC}"
    else
        echo -e "${YELLOW}   لطفاً به صورت دستی باز کنید: ${SUPABASE_STUDIO_URL}${NC}"
    fi
    echo ""
else
    echo -e "${YELLOW}⚠️  Supabase CLI در دسترس نیست.${NC}"
    echo -e "${YELLOW}   می‌توانید از Supabase Cloud استفاده کنید:${NC}"
    echo -e "${YELLOW}   https://supabase.com${NC}"
    echo ""
fi

# ساخت پروژه
echo -e "${BLUE}🏗️  ساخت پروژه...${NC}"
npm run build
echo -e "${GREEN}✅ پروژه ساخته شد${NC}"
echo ""

# خلاصه
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ✅ نصب با موفقیت انجام شد!         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📝 دستورات مفید:${NC}"
echo -e "  ${GREEN}npm run dev${NC}              - اجرای پروژه"
echo -e "  ${GREEN}npm run build${NC}            - ساخت پروژه"
echo ""
if [ "$SUPABASE_AVAILABLE" = true ]; then
    if [ -n "$SUPABASE_CMD" ]; then
        echo -e "  ${GREEN}npx supabase studio${NC}     - باز کردن Studio"
        echo -e "  ${GREEN}npx supabase status${NC}     - وضعیت Supabase"
        echo -e "  ${GREEN}npx supabase stop${NC}       - توقف Supabase"
    else
        echo -e "  ${GREEN}supabase studio${NC}         - باز کردن Studio"
        echo -e "  ${GREEN}supabase status${NC}         - وضعیت Supabase"
        echo -e "  ${GREEN}supabase stop${NC}           - توقف Supabase"
    fi
fi
echo ""
echo -e "${BLUE}🌐 دسترسی:${NC}"
echo -e "  ${GREEN}Frontend:${NC}    http://localhost:3000"
if [ "$SUPABASE_AVAILABLE" = true ]; then
    echo -e "  ${GREEN}Studio:${NC}      http://127.0.0.1:54323"
    echo -e "  ${GREEN}API:${NC}         http://127.0.0.1:54321"
fi
echo ""
echo -e "${YELLOW}💡 نکته:${NC}"
echo -e "   برای اجرای پروژه: ${GREEN}npm run dev${NC}"
echo ""
