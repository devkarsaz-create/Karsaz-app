import { Category } from "@/types";
import { getCategories } from "@/lib/api";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';

export default async function CategoryList() {
  const categories = await getCategories();

  if (!categories || categories.length === 0) {
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
              href={`/?category=${category.slug}`}
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
