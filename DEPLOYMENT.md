# راهنمای استقرار (Deployment Guide)

## نصب روی سرور

### روش ۱: استفاده از اسکریپت خودکار (توصیه می‌شود)

```bash
# اجرای اسکریپت نصب
./deploy.sh

# اجرای پروژه با PM2
pm2 start ecosystem.config.js

# مشاهده لاگ‌ها
pm2 logs karsaz
```

### روش ۲: نصب دستی

#### ۱. نصب Dependencies

```bash
npm ci
```

#### ۲. تنظیم متغیرهای محیطی

```bash
cp .env.example .env.local
# ویرایش .env.local با اطلاعات Supabase
```

#### ۳. ساخت پروژه

```bash
npm run build
```

#### ۴. اجرای پروژه

```bash
# با PM2
npm install -g pm2
pm2 start npm --name "karsaz" -- start

# یا با systemd
sudo systemctl start karsaz
```

## تنظیمات Nginx (برای HTTPS)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## تنظیمات Supabase

### برای Production

1. ایجاد پروژه Supabase در [supabase.com](https://supabase.com)
2. کپی کردن URL و Anon Key
3. تنظیم در `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### اجرای Migrations

```bash
# نصب Supabase CLI
npm install -g supabase

# Login
supabase login

# Link به پروژه
supabase link --project-ref your-project-ref

# اجرای migrations
supabase db push
```

## بهینه‌سازی‌ها

### ۱. CDN برای فایل‌های استاتیک

استفاده از Cloudflare یا AWS CloudFront برای:
- تصاویر
- فایل‌های CSS/JS
- آیکون‌ها

### ۲. Caching

```nginx
# Cache برای فایل‌های استاتیک
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### ۳. Compression

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

## Monitoring

### PM2 Monitoring

```bash
# نصب PM2 Plus
pm2 install pm2-logrotate

# مشاهده وضعیت
pm2 status
pm2 monit
```

### Log Management

```bash
# لاگ‌های PM2
pm2 logs karsaz --lines 100

# چرخش خودکار لاگ‌ها
pm2 install pm2-logrotate
```

## Backup

### Backup دیتابیس Supabase

```bash
# استفاده از Supabase CLI
supabase db dump -f backup.sql

# یا از Dashboard
# Settings > Database > Backups
```

## امنیت

### ۱. Environment Variables

- هرگز فایل `.env.local` را commit نکنید
- از secrets management استفاده کنید

### ۲. Rate Limiting

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api {
    limit_req zone=api burst=20;
}
```

### ۳. Firewall

```bash
# فقط پورت‌های لازم را باز کنید
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Troubleshooting

### مشکل: پروژه اجرا نمی‌شود

```bash
# بررسی لاگ‌ها
pm2 logs karsaz

# بررسی پورت
netstat -tulpn | grep 3000

# بررسی متغیرهای محیطی
cat .env.local
```

### مشکل: خطا در اتصال به Supabase

- بررسی URL و Key در `.env.local`
- بررسی RLS policies در Supabase
- بررسی Network connectivity

### مشکل: تصاویر لود نمی‌شوند

- بررسی Storage buckets در Supabase
- بررسی Storage policies
- بررسی CORS settings

## به‌روزرسانی

```bash
# Pull آخرین تغییرات
git pull origin main

# نصب dependencies جدید
npm ci

# ساخت مجدد
npm run build

# راه‌اندازی مجدد
pm2 restart karsaz
```

## پشتیبانی

برای مشکلات و سوالات:
- GitHub Issues: [karsaz-bot/Karsaz-app](https://github.com/karsaz-bot/Karsaz-app)
- Email: info@irantrench.com

