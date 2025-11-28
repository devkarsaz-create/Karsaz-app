// src/app/page.tsx
import { Ad, Favorite } from '@/lib/supabase';
import AdCard from '@/components/AdCard';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

// Create a plain Supabase client for general (non-authenticated) queries
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getAds(): Promise<Ad[]> {
  const { data, error } = await supabaseClient
    .from('ads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
  return data || [];
}

async function getUserFavorites(userId: string): Promise<string[]> {
  const supabase = createSupabaseServerClient(); // Use server client for authenticated queries
  const { data, error } = await supabase
    .from('favorites')
    .select('ad_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user favorites:', error);
    return [];
  }
  return data?.map((fav) => fav.ad_id) || [];
}

export default async function Home() {
  const supabaseServer = createSupabaseServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  const ads = await getAds();
  const userFavoriteAdIds = user ? await getUserFavorites(user.id) : [];

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-4xl font-bold text-center mb-8">آگهی‌های جدید</h1>
      {ads.length === 0 ? (
        <p className="text-center text-gray-400">در حال حاضر آگهی برای نمایش وجود ندارد.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} initialIsFavorite={userFavoriteAdIds.includes(ad.id)} />
          ))}
        </div>
      )}
    </div>
  );
}