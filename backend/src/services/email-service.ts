import nodemailer from 'nodemailer'
import { getEnv } from '@/config/env'
import { logger } from '@/utils/logger'

const env = getEnv()

class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS) {
      logger.warn('SMTP configuration not found. Email service disabled.')
      return
    }

    this.transporter = nodemailer.createTransporter({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })

    // Verify connection
    this.transporter.verify((error, success) => {
      if (error) {
        logger.error('SMTP connection failed:', error)
      } else {
        logger.info('✅ SMTP server ready')
      }
    })
  }

  async sendEmail(to: string, subject: string, html: string, text?: string) {
    if (!this.transporter) {
      logger.warn('Email service not configured')
      return false
    }

    try {
      const info = await this.transporter.sendMail({
        from: env.SMTP_FROM || env.SMTP_USER,
        to,
        subject,
        html,
        text,
      })

      logger.info(`Email sent: ${info.messageId}`)
      return true
    } catch (error) {
      logger.error('Failed to send email:', error)
      return false
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${env.FRONTEND_URL}/auth/verify-email?token=${token}`
    
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تأیید ایمیل</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #0f0f0f;
            color: #ffffff;
            margin: 0;
            padding: 20px;
            direction: rtl;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1a1a1a;
            border-radius: 12px;
            padding: 40px;
            border: 1px solid #333;
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo h1 {
            color: #6366f1;
            font-size: 32px;
            margin: 0;
            font-weight: bold;
          }
          .content {
            text-align: center;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #ffffff;
          }
          .message {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
            color: #d1d5db;
          }
          .button {
            display: inline-block;
            background-color: #6366f1;
            color: #ffffff;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            transition: background-color 0.3s;
          }
          .button:hover {
            background-color: #5855eb;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #333;
            text-align: center;
            font-size: 14px;
            color: #9ca3af;
          }
          .warning {
            background-color: #1f2937;
            border: 1px solid #374151;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
            font-size: 14px;
            color: #d1d5db;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>کارساز</h1>
          </div>
          
          <div class="content">
            <h2 class="title">تأیید ایمیل شما</h2>
            
            <p class="message">
              سلام!<br>
              برای تکمیل ثبت‌نام در کارساز، لطفاً ایمیل خود را تأیید کنید.
            </p>
            
            <a href="${verificationUrl}" class="button">تأیید ایمیل</a>
            
            <div class="warning">
              <strong>توجه:</strong> این لینک تا ۲۴ ساعت معتبر است. اگر شما این درخواست را نداده‌اید، این ایمیل را نادیده بگیرید.
            </div>
          </div>
          
          <div class="footer">
            <p>© ۲۰۲۴ کارساز. تمامی حقوق محفوظ است.</p>
            <p>این ایمیل به صورت خودکار ارسال شده است. لطفاً پاسخ ندهید.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      تأیید ایمیل - کارساز
      
      سلام!
      
      برای تکمیل ثبت‌نام در کارساز، لطفاً روی لینک زیر کلیک کنید:
      ${verificationUrl}
      
      این لینک تا ۲۴ ساعت معتبر است.
      
      اگر شما این درخواست را نداده‌اید، این ایمیل را نادیده بگیرید.
      
      © ۲۰۲۴ کارساز
    `

    return this.sendEmail(email, 'تأیید ایمیل - کارساز', html, text)
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${token}`
    
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>بازیابی رمز عبور</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #0f0f0f;
            color: #ffffff;
            margin: 0;
            padding: 20px;
            direction: rtl;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1a1a1a;
            border-radius: 12px;
            padding: 40px;
            border: 1px solid #333;
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo h1 {
            color: #6366f1;
            font-size: 32px;
            margin: 0;
            font-weight: bold;
          }
          .content {
            text-align: center;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #ffffff;
          }
          .message {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
            color: #d1d5db;
          }
          .button {
            display: inline-block;
            background-color: #ef4444;
            color: #ffffff;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            transition: background-color 0.3s;
          }
          .button:hover {
            background-color: #dc2626;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #333;
            text-align: center;
            font-size: 14px;
            color: #9ca3af;
          }
          .warning {
            background-color: #1f2937;
            border: 1px solid #374151;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
            font-size: 14px;
            color: #d1d5db;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>کارساز</h1>
          </div>
          
          <div class="content">
            <h2 class="title">بازیابی رمز عبور</h2>
            
            <p class="message">
              سلام!<br>
              درخواست بازیابی رمز عبور برای حساب کاربری شما دریافت شد.
            </p>
            
            <a href="${resetUrl}" class="button">تغییر رمز عبور</a>
            
            <div class="warning">
              <strong>توجه:</strong> این لینک تا ۱ ساعت معتبر است. اگر شما این درخواست را نداده‌اید، این ایمیل را نادیده بگیرید و رمز عبور شما تغییر نخواهد کرد.
            </div>
          </div>
          
          <div class="footer">
            <p>© ۲۰۲۴ کارساز. تمامی حقوق محفوظ است.</p>
            <p>این ایمیل به صورت خودکار ارسال شده است. لطفاً پاسخ ندهید.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      بازیابی رمز عبور - کارساز
      
      سلام!
      
      درخواست بازیابی رمز عبور برای حساب کاربری شما دریافت شد.
      
      برای تغییر رمز عبور، روی لینک زیر کلیک کنید:
      ${resetUrl}
      
      این لینک تا ۱ ساعت معتبر است.
      
      اگر شما این درخواست را نداده‌اید، این ایمیل را نادیده بگیرید.
      
      © ۲۰۲۴ کارساز
    `

    return this.sendEmail(email, 'بازیابی رمز عبور - کارساز', html, text)
  }

  async sendWelcomeEmail(email: string, fullName: string) {
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>خوش آمدید</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #0f0f0f;
            color: #ffffff;
            margin: 0;
            padding: 20px;
            direction: rtl;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1a1a1a;
            border-radius: 12px;
            padding: 40px;
            border: 1px solid #333;
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo h1 {
            color: #6366f1;
            font-size: 32px;
            margin: 0;
            font-weight: bold;
          }
          .content {
            text-align: center;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #ffffff;
          }
          .message {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
            color: #d1d5db;
          }
          .features {
            text-align: right;
            margin: 30px 0;
            background-color: #111827;
            border-radius: 8px;
            padding: 20px;
          }
          .features h3 {
            color: #6366f1;
            margin-bottom: 15px;
          }
          .features ul {
            list-style: none;
            padding: 0;
          }
          .features li {
            padding: 8px 0;
            border-bottom: 1px solid #374151;
          }
          .features li:last-child {
            border-bottom: none;
          }
          .button {
            display: inline-block;
            background-color: #10b981;
            color: #ffffff;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            transition: background-color 0.3s;
          }
          .button:hover {
            background-color: #059669;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #333;
            text-align: center;
            font-size: 14px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>کارساز</h1>
          </div>
          
          <div class="content">
            <h2 class="title">خوش آمدید ${fullName || ''}!</h2>
            
            <p class="message">
              از اینکه به خانواده کارساز پیوستید خوشحالیم!<br>
              حالا می‌توانید از تمام امکانات پلتفرم استفاده کنید.
            </p>
            
            <div class="features">
              <h3>امکانات کارساز:</h3>
              <ul>
                <li>🔍 جستجوی پیشرفته در میان هزاران آگهی</li>
                <li>📱 ثبت آگهی رایگان و آسان</li>
                <li>💬 چت مستقیم با فروشندگان</li>
                <li>❤️ ذخیره آگهی‌های مورد علاقه</li>
                <li>🔔 اطلاع‌رسانی آگهی‌های جدید</li>
                <li>⭐ امتیازدهی و نظرات کاربران</li>
              </ul>
            </div>
            
            <a href="${env.FRONTEND_URL}" class="button">شروع کنید</a>
          </div>
          
          <div class="footer">
            <p>© ۲۰۲۴ کارساز. تمامی حقوق محفوظ است.</p>
            <p>این ایمیل به صورت خودکار ارسال شده است. لطفاً پاسخ ندهید.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail(email, 'خوش آمدید به کارساز!', html)
  }
}

export const emailService = new EmailService()