// src/app/new-ad/page.tsx
import NewAdForm from '@/components/NewAdForm';
import { Category } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabaseClient.from('categories').select('*');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data || [];
}

export default async function NewAdPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">ثبت آگهی جدید</h1>
      <NewAdForm categories={categories} />
    </div>
  );
}
