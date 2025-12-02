#!/bin/bash

# ============================================
# اسکریپت اجرای کامل کارساز
# راه‌اندازی Supabase + Studio + Frontend
# ============================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      🚀 راه‌اندازی کارساز             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# بررسی .env.local
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}📝 ایجاد فایل .env.local...${NC}"
    cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo -e "${GREEN}✅ فایل .env.local ایجاد شد${NC}"
fi

# بررسی Supabase
SUPABASE_CMD=""
if command -v supabase &> /dev/null; then
    SUPABASE_CMD="supabase"
elif command -v npx &> /dev/null; then
    SUPABASE_CMD="npx supabase"
    echo -e "${YELLOW}⚠️  استفاده از npx supabase${NC}"
fi

# راه‌اندازی Supabase
if [ -n "$SUPABASE_CMD" ]; then
    echo -e "${BLUE}🗄️  بررسی Supabase...${NC}"
    
    if $SUPABASE_CMD status &> /dev/null; then
        echo -e "${GREEN}✅ Supabase در حال اجرا است${NC}"
    else
        echo -e "${YELLOW}🔄 راه‌اندازی Supabase...${NC}"
        $SUPABASE_CMD start 2>&1 | head -20
        sleep 3
    fi
    
    # نمایش اطلاعات
    echo ""
    echo -e "${BLUE}📊 اطلاعات Supabase:${NC}"
    $SUPABASE_CMD status 2>/dev/null | head -10 || true
    echo ""
    
    # Studio URL
    STUDIO_URL="http://127.0.0.1:54323"
    echo -e "${GREEN}🎨 Supabase Studio: ${STUDIO_URL}${NC}"
    
    # باز کردن Studio
    if command -v xdg-open &> /dev/null; then
        (sleep 2 && xdg-open "$STUDIO_URL" 2>/dev/null) &
    elif command -v open &> /dev/null; then
        (sleep 2 && open "$STUDIO_URL" 2>/dev/null) &
    fi
    echo ""
else
    echo -e "${YELLOW}⚠️  Supabase CLI پیدا نشد${NC}"
    echo -e "${YELLOW}   می‌توانید از Supabase Cloud استفاده کنید${NC}"
    echo ""
fi

# اجرای Frontend
echo -e "${BLUE}🌐 راه‌اندازی Frontend...${NC}"
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        ✅ همه چیز آماده است!          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}🌐 دسترسی:${NC}"
echo -e "  ${GREEN}Frontend:${NC}    http://localhost:3000"
if [ -n "$SUPABASE_CMD" ]; then
    echo -e "  ${GREEN}Studio:${NC}      http://127.0.0.1:54323"
fi
echo ""
echo -e "${YELLOW}💡 برای توقف: Ctrl+C${NC}"
echo ""

# اجرای Next.js
exec npm run dev

