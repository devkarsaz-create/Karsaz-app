import { PrismaClient } from '@prisma/client'
import * as argon2 from 'argon2'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create categories
  const categories = [
    {
      name: 'خودرو',
      slug: 'vehicles',
      description: 'خرید و فروش خودرو، موتورسیکلت و وسایل نقلیه',
      icon: '🚗',
      children: [
        { name: 'خودرو سواری', slug: 'cars', description: 'خودروهای سواری' },
        { name: 'موتورسیکلت', slug: 'motorcycles', description: 'موتورسیکلت و اسکوتر' },
        { name: 'کامیون و تریلر', slug: 'trucks', description: 'کامیون، تریلر و خودروهای سنگین' },
        { name: 'لوازم یدکی', slug: 'auto-parts', description: 'لوازم یدکی خودرو' },
      ]
    },
    {
      name: 'املاک',
      slug: 'real-estate',
      description: 'خرید، فروش و اجاره املاک',
      icon: '🏠',
      children: [
        { name: 'آپارتمان', slug: 'apartments', description: 'خرید و فروش آپارتمان' },
        { name: 'خانه و ویلا', slug: 'houses', description: 'خانه، ویلا و باغ' },
        { name: 'زمین و کلنگی', slug: 'land', description: 'زمین مسکونی و تجاری' },
        { name: 'اجاره مسکونی', slug: 'residential-rent', description: 'اجاره آپارتمان و خانه' },
        { name: 'اجاره تجاری', slug: 'commercial-rent', description: 'اجاره مغازه و دفتر' },
      ]
    },
    {
      name: 'کالای دیجیتال',
      slug: 'digital',
      description: 'موبایل، تبلت، لپ‌تاپ و لوازم دیجیتال',
      icon: '📱',
      children: [
        { name: 'موبایل', slug: 'mobile', description: 'گوشی موبایل و تبلت' },
        { name: 'کامپیوتر', slug: 'computer', description: 'لپ‌تاپ، کامپیوتر و قطعات' },
        { name: 'کنسول بازی', slug: 'gaming', description: 'کنسول و بازی' },
        { name: 'دوربین', slug: 'camera', description: 'دوربین عکاسی و فیلمبرداری' },
      ]
    },
    {
      name: 'خانه و آشپزخانه',
      slug: 'home-kitchen',
      description: 'لوازم خانگی، آشپزخانه و دکوراسیون',
      icon: '🏡',
      children: [
        { name: 'لوازم خانگی', slug: 'appliances', description: 'یخچال، ماشین لباسشویی و...' },
        { name: 'مبلمان', slug: 'furniture', description: 'مبل، میز، صندلی و کمد' },
        { name: 'آشپزخانه', slug: 'kitchen', description: 'لوازم آشپزخانه و غذاخوری' },
        { name: 'دکوراسیون', slug: 'decoration', description: 'تابلو، گلدان و وسایل تزئینی' },
      ]
    },
    {
      name: 'مد و پوشاک',
      slug: 'fashion',
      description: 'لباس، کفش، کیف و اکسسوری',
      icon: '👕',
      children: [
        { name: 'لباس زنانه', slug: 'womens-clothing', description: 'لباس و پوشاک زنانه' },
        { name: 'لباس مردانه', slug: 'mens-clothing', description: 'لباس و پوشاک مردانه' },
        { name: 'کفش', slug: 'shoes', description: 'کفش زنانه و مردانه' },
        { name: 'کیف و کوله', slug: 'bags', description: 'کیف، کوله و چمدان' },
        { name: 'ساعت و جواهرات', slug: 'jewelry', description: 'ساعت، انگشتر و جواهرات' },
      ]
    },
    {
      name: 'ورزش و سرگرمی',
      slug: 'sports',
      description: 'لوازم ورزشی، کتاب و سرگرمی',
      icon: '⚽',
      children: [
        { name: 'ورزش', slug: 'sports-equipment', description: 'لوازم ورزشی و فیتنس' },
        { name: 'کتاب', slug: 'books', description: 'کتاب و مجله' },
        { name: 'موسیقی', slug: 'music', description: 'آلات موسیقی' },
        { name: 'اسباب بازی', slug: 'toys', description: 'اسباب بازی کودک' },
      ]
    },
    {
      name: 'خدمات',
      slug: 'services',
      description: 'خدمات مختلف',
      icon: '🔧',
      children: [
        { name: 'خدمات فنی', slug: 'technical-services', description: 'تعمیرات و خدمات فنی' },
        { name: 'خدمات آموزشی', slug: 'education', description: 'کلاس و دوره آموزشی' },
        { name: 'خدمات پزشکی', slug: 'medical', description: 'خدمات درمانی و پزشکی' },
        { name: 'خدمات حمل و نقل', slug: 'transportation', description: 'باربری و حمل و نقل' },
      ]
    },
    {
      name: 'استخدام',
      slug: 'jobs',
      description: 'فرصت‌های شغلی',
      icon: '💼',
      children: [
        { name: 'فناوری اطلاعات', slug: 'it-jobs', description: 'مشاغل IT و برنامه‌نویسی' },
        { name: 'مهندسی', slug: 'engineering-jobs', description: 'مشاغل مهندسی' },
        { name: 'فروش و بازاریابی', slug: 'sales-jobs', description: 'مشاغل فروش و بازاریابی' },
        { name: 'خدمات', slug: 'service-jobs', description: 'مشاغل خدماتی' },
      ]
    }
  ]

  console.log('📂 Creating categories...')
  
  for (const categoryData of categories) {
    const { children, ...parentData } = categoryData
    
    const parent = await prisma.category.upsert({
      where: { slug: parentData.slug },
      update: parentData,
      create: {
        ...parentData,
        sortOrder: categories.indexOf(categoryData),
      }
    })

    if (children) {
      for (const childData of children) {
        await prisma.category.upsert({
          where: { slug: childData.slug },
          update: childData,
          create: {
            ...childData,
            parentId: parent.id,
            sortOrder: children.indexOf(childData),
          }
        })
      }
    }
  }

  console.log('✅ Categories created successfully')

  // Create admin user
  console.log('👤 Creating admin user...')
  
  const hashedPassword = await argon2.hash('admin123456')
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@karsaz.com' },
    update: {},
    create: {
      email: 'admin@karsaz.com',
      password: hashedPassword,
      fullName: 'مدیر سیستم',
      role: 'ADMIN',
      isVerified: true,
      emailVerified: new Date(),
    }
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Create sample users
  console.log('👥 Creating sample users...')
  
  const sampleUsers = [
    {
      email: 'user1@example.com',
      fullName: 'علی احمدی',
      phone: '09123456789',
      location: 'تهران',
      bio: 'علاقه‌مند به خرید و فروش کالاهای دیجیتال'
    },
    {
      email: 'user2@example.com',
      fullName: 'فاطمه محمدی',
      phone: '09987654321',
      location: 'اصفهان',
      bio: 'فروشنده لوازم خانگی'
    },
    {
      email: 'user3@example.com',
      fullName: 'محمد رضایی',
      phone: '09111111111',
      location: 'شیراز',
      bio: 'متخصص خودرو'
    }
  ]

  for (const userData of sampleUsers) {
    const hashedPassword = await argon2.hash('password123')
    
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: hashedPassword,
        isVerified: true,
        emailVerified: new Date(),
      }
    })
  }

  console.log('✅ Sample users created successfully')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })