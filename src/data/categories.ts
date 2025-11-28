export interface Category {
  id: string
  name: string
  icon: string
  count: number
  subcategories: Subcategory[]
}

export interface Subcategory {
  id: string
  name: string
  count: number
}

export const categories: Category[] = [
  {
    id: 'real-estate',
    name: 'املاک',
    icon: '🏠',
    count: 12450,
    subcategories: [
      { id: 'apartment-sale', name: 'فروش آپارتمان', count: 3200 },
      { id: 'apartment-rent', name: 'اجاره آپارتمان', count: 2800 },
      { id: 'house-sale', name: 'فروش خانه و ویلا', count: 1500 },
      { id: 'house-rent', name: 'اجاره خانه و ویلا', count: 1200 },
      { id: 'office-sale', name: 'فروش دفتر کار', count: 800 },
      { id: 'office-rent', name: 'اجاره دفتر کار', count: 900 },
      { id: 'shop-sale', name: 'فروش مغازه', count: 600 },
      { id: 'shop-rent', name: 'اجاره مغازه', count: 700 },
      { id: 'land', name: 'زمین و کلنگی', count: 650 }
    ]
  },
  {
    id: 'vehicles',
    name: 'خودرو',
    icon: '🚗',
    count: 8320,
    subcategories: [
      { id: 'car-sale', name: 'فروش خودرو', count: 4500 },
      { id: 'motorcycle', name: 'موتورسیکلت', count: 1200 },
      { id: 'heavy-vehicles', name: 'خودروهای سنگین', count: 800 },
      { id: 'car-parts', name: 'لوازم یدکی', count: 900 },
      { id: 'car-accessories', name: 'لوازم جانبی خودرو', count: 600 },
      { id: 'boat', name: 'قایق و لنج', count: 120 },
      { id: 'classic-cars', name: 'خودروهای کلاسیک', count: 200 }
    ]
  },
  {
    id: 'jobs',
    name: 'استخدام و کار',
    icon: '💼',
    count: 5680,
    subcategories: [
      { id: 'it-jobs', name: 'فناوری اطلاعات', count: 1200 },
      { id: 'engineering', name: 'مهندسی', count: 800 },
      { id: 'sales-marketing', name: 'فروش و بازاریابی', count: 600 },
      { id: 'finance', name: 'مالی و حسابداری', count: 500 },
      { id: 'healthcare', name: 'پزشکی و درمان', count: 450 },
      { id: 'education', name: 'آموزش', count: 400 },
      { id: 'construction', name: 'ساختمان و معماری', count: 350 },
      { id: 'hospitality', name: 'هتلداری و گردشگری', count: 300 },
      { id: 'transportation', name: 'حمل و نقل', count: 280 },
      { id: 'manufacturing', name: 'تولید و صنعت', count: 250 },
      { id: 'art-design', name: 'هنر و طراحی', count: 200 },
      { id: 'security', name: 'امنیت و نگهبانی', count: 180 },
      { id: 'cleaning', name: 'نظافت و خدمات', count: 170 }
    ]
  },
  {
    id: 'services',
    name: 'خدمات',
    icon: '🔧',
    count: 3240,
    subcategories: [
      { id: 'home-services', name: 'خدمات منزل', count: 800 },
      { id: 'repair-services', name: 'تعمیرات', count: 600 },
      { id: 'beauty-health', name: 'زیبایی و سلامت', count: 450 },
      { id: 'education-services', name: 'آموزش و کلاس', count: 400 },
      { id: 'event-services', name: 'مراسم و رویداد', count: 300 },
      { id: 'transport-services', name: 'حمل و نقل', count: 250 },
      { id: 'legal-services', name: 'حقوقی و قانونی', count: 200 },
      { id: 'financial-services', name: 'مالی و بیمه', count: 150 },
      { id: 'web-services', name: 'طراحی وب و اپلیکیشن', count: 90 }
    ]
  },
  {
    id: 'electronics',
    name: 'وسایل الکترونیکی',
    icon: '📱',
    count: 9870,
    subcategories: [
      { id: 'mobile-tablet', name: 'موبایل و تبلت', count: 3500 },
      { id: 'laptop-computer', name: 'لپ‌تاپ و کامپیوتر', count: 2200 },
      { id: 'audio-video', name: 'صوتی و تصویری', count: 1500 },
      { id: 'gaming', name: 'بازی و سرگرمی', count: 800 },
      { id: 'camera-photo', name: 'دوربین و عکاسی', count: 600 },
      { id: 'home-appliances', name: 'لوازم خانگی برقی', count: 900 },
      { id: 'accessories', name: 'لوازم جانبی', count: 370 }
    ]
  },
  {
    id: 'home-garden',
    name: 'خانه و باغ',
    icon: '🏡',
    count: 4560,
    subcategories: [
      { id: 'furniture', name: 'مبلمان و دکوراسیون', count: 1800 },
      { id: 'kitchen-dining', name: 'آشپزخانه و غذاخوری', count: 900 },
      { id: 'garden-tools', name: 'باغ و ابزار باغبانی', count: 600 },
      { id: 'home-textiles', name: 'منسوجات خانه', count: 500 },
      { id: 'lighting', name: 'روشنایی و لوستر', count: 400 },
      { id: 'bathroom', name: 'حمام و سرویس بهداشتی', count: 360 }
    ]
  },
  {
    id: 'fashion-beauty',
    name: 'مد و زیبایی',
    icon: '👗',
    count: 6780,
    subcategories: [
      { id: 'womens-clothing', name: 'لباس زنانه', count: 2500 },
      { id: 'mens-clothing', name: 'لباس مردانه', count: 1800 },
      { id: 'shoes-bags', name: 'کیف و کفش', count: 1200 },
      { id: 'jewelry-accessories', name: 'زیورآلات و اکسسوری', count: 800 },
      { id: 'cosmetics', name: 'آرایشی و بهداشتی', count: 480 }
    ]
  },
  {
    id: 'sports-entertainment',
    name: 'ورزش و سرگرمی',
    icon: '⚽',
    count: 2150,
    subcategories: [
      { id: 'sports-equipment', name: 'تجهیزات ورزشی', count: 800 },
      { id: 'outdoor-camping', name: 'کوهنوردی و کمپینگ', count: 400 },
      { id: 'books-media', name: 'کتاب و رسانه', count: 350 },
      { id: 'musical-instruments', name: 'آلات موسیقی', count: 300 },
      { id: 'toys-games', name: 'اسباب بازی', count: 200 },
      { id: 'collectibles', name: 'کلکسیون و آنتیک', count: 100 }
    ]
  },
  {
    id: 'business-industrial',
    name: 'تجاری و صنعتی',
    icon: '🏭',
    count: 1890,
    subcategories: [
      { id: 'machinery', name: 'ماشین آلات صنعتی', count: 600 },
      { id: 'office-equipment', name: 'تجهیزات اداری', count: 400 },
      { id: 'raw-materials', name: 'مواد اولیه', count: 300 },
      { id: 'packaging', name: 'بسته‌بندی', count: 200 },
      { id: 'safety-equipment', name: 'تجهیزات ایمنی', count: 190 },
      { id: 'business-services', name: 'خدمات تجاری', count: 200 }
    ]
  }
]

export const jobCategories = [
  {
    id: 'technology',
    name: 'فناوری اطلاعات',
    subcategories: [
      'برنامه‌نویس وب',
      'برنامه‌نویس موبایل',
      'طراح UI/UX',
      'مدیر پروژه IT',
      'تحلیلگر سیستم',
      'مهندس DevOps',
      'متخصص امنیت سایبری',
      'مهندس داده',
      'متخصص هوش مصنوعی'
    ]
  },
  {
    id: 'engineering',
    name: 'مهندسی',
    subcategories: [
      'مهندس عمران',
      'مهندس معماری',
      'مهندس مکانیک',
      'مهندس برق',
      'مهندس شیمی',
      'مهندس صنایع',
      'مهندس کامپیوتر',
      'مهندس نفت'
    ]
  },
  {
    id: 'healthcare',
    name: 'پزشکی و درمان',
    subcategories: [
      'پزشک عمومی',
      'پزشک متخصص',
      'پرستار',
      'دندانپزشک',
      'داروساز',
      'فیزیوتراپیست',
      'تکنسین پزشکی',
      'روانشناس'
    ]
  }
]

export const serviceCategories = [
  {
    id: 'home-services',
    name: 'خدمات منزل',
    subcategories: [
      'تعمیر لوازم خانگی',
      'نظافت منزل',
      'باغبانی',
      'نقاشی ساختمان',
      'تعمیر لوله‌کشی',
      'تعمیر برق',
      'کولر و پکیج',
      'حمل اثاثیه'
    ]
  },
  {
    id: 'beauty-health',
    name: 'زیبایی و سلامت',
    subcategories: [
      'آرایشگاه زنانه',
      'آرایشگاه مردانه',
      'ماساژ درمانی',
      'پیرایش',
      'میکاپ و عروس',
      'لاغری و تناسب اندام',
      'مراقبت پوست'
    ]
  }
]
