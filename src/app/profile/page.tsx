// src/app/profile/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Ad } from '@/lib/supabase';
import AdCard from '@/components/AdCard';
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getUserAds(userId: string): Promise<Ad[]> {
  const { data, error } = await supabaseClient
    .from('ads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user ads:', error);
    return [];
  }
  return data || [];
}

// We need to check if an ad is a favorite for the profile page too
async function isAdFavorite(userId: string | undefined, adId: string): Promise<boolean> {
  if (!userId) return false;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('ad_id', adId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('Error checking favorite status:', error);
    return false;
  }
  return !!data;
}

export default async function ProfilePage() {
  const supabaseServer = createSupabaseServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const userAds = await getUserAds(user.id);
  const userFavoriteAdIds = await isAdFavorite(user?.id, ""); // This needs to be called for each ad, not just once

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-4xl font-bold text-center mb-8">پروفایل کاربری</h1>
      <p className="text-center text-lg text-gray-400 mb-8">ایمیل: {user.email}</p>

      <h2 className="text-3xl font-bold mb-6">آگهی‌های من</h2>
      {userAds.length === 0 ? (
        <p className="text-center text-gray-400">شما تا کنون آگهی ثبت نکرده‌اید.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {userAds.map(async (ad) => ( // Make this a Client Component if you want interactive buttons
            <div key={ad.id} className="relative group">
              <AdCard ad={ad} initialIsFavorite={await isAdFavorite(user?.id, ad.id)} />
              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* <Button variant="secondary" size="sm">ویرایش</Button>
                <Button variant="destructive" size="sm">حذف</Button> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}