import { Category } from "../lib/supabase";
import Link from "next/link";
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabaseClient
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      // اگر جدول وجود ندارد، از داده‌های استاتیک استفاده کن
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Categories table does not exist yet. Using static data.');
        return getStaticCategories();
      }
      console.error('Error fetching categories:', error);
      return getStaticCategories();
    }
    return data && data.length > 0 ? data : getStaticCategories();
  } catch (err) {
    console.warn('Error connecting to Supabase:', err);
    return getStaticCategories();
  }
}

function getStaticCategories(): Category[] {
  return [
    { id: '1', name: 'املاک', icon: '🏠', parent_id: null, created_at: new Date().toISOString() },
    { id: '2', name: 'خودرو', icon: '🚗', parent_id: null, created_at: new Date().toISOString() },
    { id: '3', name: 'استخدام و کار', icon: '💼', parent_id: null, created_at: new Date().toISOString() },
    { id: '4', name: 'خدمات', icon: '🔧', parent_id: null, created_at: new Date().toISOString() },
    { id: '5', name: 'وسایل الکترونیکی', icon: '📱', parent_id: null, created_at: new Date().toISOString() },
    { id: '6', name: 'خانه و باغ', icon: '🏡', parent_id: null, created_at: new Date().toISOString() },
    { id: '7', name: 'مد و زیبایی', icon: '👗', parent_id: null, created_at: new Date().toISOString() },
    { id: '8', name: 'ورزش و سرگرمی', icon: '⚽', parent_id: null, created_at: new Date().toISOString() },
    { id: '9', name: 'تجاری و صنعتی', icon: '🏭', parent_id: null, created_at: new Date().toISOString() },
  ];
}

export default async function CategoryList() {
  const categories = await getCategories();

  if (categories.length === 0) {
    return (
      <Card className="glass-effect border-white/10 mb-8">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">در حال حاضر دسته‌بندی برای نمایش وجود ندارد.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
        <h2 className="text-3xl font-bold gradient-text">دسته‌بندی‌ها</h2>
      </motion.div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Link
              href={`/?category=${category.id}`}
              className="block h-full group"
            >
              <Card className="h-full glass-effect border-white/10 hover-lift overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 flex flex-col items-center justify-center aspect-square text-center relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-5xl mb-4 filter drop-shadow-lg"
                  >
                    {category.icon || '📦'}
                  </motion.div>
                  <p className="text-base font-semibold group-hover:text-primary transition-colors">
                    {category.name}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
