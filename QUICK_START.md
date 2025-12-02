# 🚀 راهنمای سریع شروع

## نصب و راه‌اندازی با یک دستور

```bash
./install.sh
```

این دستور به صورت خودکار:
- ✅ Dependencies را نصب می‌کند
- ✅ Supabase Local را راه‌اندازی می‌کند
- ✅ Supabase Studio را باز می‌کند
- ✅ Migrations را اجرا می‌کند
- ✅ پروژه را می‌سازد

## اجرای پروژه

```bash
./start.sh
```

یا به صورت دستی:

```bash
# راه‌اندازی Supabase (اگر نصب است)
npx supabase start

# اجرای Frontend
npm run dev
```

## دسترسی

- **Frontend**: http://localhost:3000
- **Supabase Studio**: http://127.0.0.1:54323
- **API**: http://127.0.0.1:54321

## اگر Supabase CLI نصب نیست

### روش ۱: استفاده از npx (بدون نیاز به نصب)
```bash
npx supabase start
npx supabase studio
```

### روش ۲: نصب Supabase CLI
```bash
curl -fsSL https://supabase.com/install.sh | sh
```

### روش ۳: استفاده از Supabase Cloud
1. به [supabase.com](https://supabase.com) بروید
2. پروژه رایگان ایجاد کنید
3. URL و Key را در `.env.local` قرار دهید

## مشکلات رایج

### خطای Permission
اگر خطای permission دیدید، از `npx supabase` استفاده کنید.

### Supabase شروع نمی‌شود
مطمئن شوید Docker در حال اجرا است:
```bash
docker --version
```

### پورت‌ها اشغال هستند
```bash
# توقف Supabase
npx supabase stop

# یا تغییر پورت در supabase/config.toml
```

## دستورات مفید

```bash
# وضعیت Supabase
npx supabase status

# باز کردن Studio
npx supabase studio

# توقف Supabase
npx supabase stop

# راه‌اندازی مجدد
npx supabase start

# مشاهده لاگ‌ها
npx supabase logs
```

