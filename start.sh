#!/bin/bash

# ============================================
# اسکریپت راه‌اندازی کامل کارساز
# شامل: Supabase + Studio + Frontend
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      🚀 راه‌اندازی کارساز             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# بررسی Supabase CLI
SUPABASE_CMD=""
if command -v supabase &> /dev/null; then
    SUPABASE_CMD="supabase"
elif command -v npx &> /dev/null; then
    SUPABASE_CMD="npx supabase"
    echo -e "${YELLOW}⚠️  استفاده از npx supabase${NC}"
else
    echo -e "${YELLOW}⚠️  Supabase CLI پیدا نشد. فقط Frontend اجرا می‌شود.${NC}"
fi

# راه‌اندازی Supabase
if [ -n "$SUPABASE_CMD" ]; then
    echo -e "${BLUE}🗄️  بررسی وضعیت Supabase...${NC}"
    
    # بررسی وضعیت
    if $SUPABASE_CMD status &> /dev/null; then
        echo -e "${GREEN}✅ Supabase در حال اجرا است${NC}"
    else
        echo -e "${YELLOW}🔄 در حال راه‌اندازی Supabase...${NC}"
        $SUPABASE_CMD start
        echo -e "${GREEN}✅ Supabase راه‌اندازی شد${NC}"
    fi
    
    # نمایش اطلاعات
    echo ""
    echo -e "${BLUE}📊 اطلاعات Supabase:${NC}"
    $SUPABASE_CMD status 2>/dev/null || echo "در حال راه‌اندازی..."
    echo ""
    
    # باز کردن Studio
    SUPABASE_STUDIO_URL="http://127.0.0.1:54323"
    echo -e "${BLUE}🎨 Supabase Studio:${NC}"
    echo -e "${GREEN}   ${SUPABASE_STUDIO_URL}${NC}"
    echo ""
    
    # باز کردن خودکار در مرورگر
    if command -v xdg-open &> /dev/null; then
        (sleep 3 && xdg-open "$SUPABASE_STUDIO_URL" 2>/dev/null) &
    elif command -v open &> /dev/null; then
        (sleep 3 && open "$SUPABASE_STUDIO_URL" 2>/dev/null) &
    fi
fi

# اجرای Frontend
echo -e "${BLUE}🌐 راه‌اندازی Frontend...${NC}"
echo -e "${GREEN}✅ Frontend در حال اجرا است${NC}"
echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        ✅ همه چیز آماده است!          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}🌐 دسترسی:${NC}"
echo -e "  ${GREEN}Frontend:${NC}    http://localhost:3000"
if [ -n "$SUPABASE_CMD" ]; then
    echo -e "  ${GREEN}Studio:${NC}      http://127.0.0.1:54323"
    echo -e "  ${GREEN}API:${NC}         http://127.0.0.1:54321"
fi
echo ""
echo -e "${YELLOW}💡 برای توقف: Ctrl+C${NC}"
echo ""

# اجرای Next.js
npm run dev

