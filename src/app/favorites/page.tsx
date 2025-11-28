// src/app/favorites/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Ad } from '@/lib/supabase';
import AdCard from '@/components/AdCard';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getUserFavoriteAds(userId: string): Promise<Ad[]> {
  const { data, error } = await supabaseClient
    .from('favorites')
    .select('*, ads(*)') // Select favorite entries and join with ad details
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user favorite ads:', error);
    return [];
  }
  
  // Extract ad data from the joined result
  return data?.map((favorite) => favorite.ads as Ad) || [];
}

export default async function FavoritesPage() {
  const supabaseServer = createSupabaseServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const favoriteAds = await getUserFavoriteAds(user.id);

  // For favorite ads, they are all implicitly favorited by the current user
  const initialIsFavoriteForCards = true;

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-4xl font-bold text-center mb-8">آگهی‌های مورد علاقه</h1>
      {favoriteAds.length === 0 ? (
        <p className="text-center text-gray-400">شما تا کنون آگهی به علاقه‌مندی‌های خود اضافه نکرده‌اید.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteAds.map((ad) => (
            <AdCard key={ad.id} ad={ad} initialIsFavorite={initialIsFavoriteForCards} />
          ))}
        </div>
      )}
    </div>
  );
}