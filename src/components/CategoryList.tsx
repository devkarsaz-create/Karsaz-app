// src/components/CategoryList.tsx
"use client";

import { Category } from "../lib/supabase";
import Link from "next/link";

interface CategoryListProps {
  categories: Category[];
}

export default function CategoryList({ categories }: CategoryListProps) {
  if (categories.length === 0) {
    return <p className="text-gray-400">در حال حاضر دسته‌بندی برای نمایش وجود ندارد.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-right">دسته‌بندی‌ها</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Link
            href={`/categories/${category.id}`}
            key={category.id}
            className="bg-gray-800 p-4 rounded-lg shadow-md hover:bg-gray-700 transition-colors flex flex-col items-center justify-center aspect-square"
          >
            <span className="text-4xl mb-2">{category.icon}</span>
            <p className="text-base font-semibold text-center">{category.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}