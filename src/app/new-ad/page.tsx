import NewAdForm from '@/components/NewAdForm';
import { Category } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

async function getCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data || [];
}

export default async function NewAdPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/new-ad');
  }

  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <NewAdForm categories={categories} />
    </div>
  );
}
