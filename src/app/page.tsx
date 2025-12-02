import { Ad } from '@/lib/supabase';
import AdCard from '@/components/AdCard';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { Suspense } from 'react';
import CategoryList from '@/components/CategoryList';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Sparkles } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getFeaturedAds(): Promise<Ad[]> {
  try {
    const { data, error } = await supabaseClient
      .from('ads')
      .select('*')
      .eq('status', 'active')
      .eq('is_featured', true)
      .or('featured_until.is.null,featured_until.gt.' + new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(8);

    if (error) {
      // اگر جدول وجود ندارد، آرایه خالی برگردان
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return [];
      }
      console.error('Error fetching featured ads:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Error connecting to Supabase:', err);
    return [];
  }
}

async function getRecentAds(): Promise<Ad[]> {
  try {
    const { data, error } = await supabaseClient
      .from('ads')
      .select('*')
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      // اگر جدول وجود ندارد، آرایه خالی برگردان
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Ads table does not exist yet. Run migrations first.');
        return [];
      }
      console.error('Error fetching recent ads:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Error connecting to Supabase:', err);
    return [];
  }
}

async function getUserFavorites(userId: string): Promise<string[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('favorites')
      .select('ad_id')
      .eq('user_id', userId);

    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return [];
      }
      console.error('Error fetching user favorites:', error);
      return [];
    }
    return data?.map((fav) => fav.ad_id) || [];
  } catch (err) {
    console.warn('Error connecting to Supabase for favorites:', err);
    return [];
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const params = await searchParams;
  let user = null;
  let userFavoriteAdIds: string[] = [];
  
  try {
    const supabaseServer = await createSupabaseServerClient();
    const { data: { user: authUser } } = await supabaseServer.auth.getUser();
    user = authUser;
    
    if (user) {
      userFavoriteAdIds = await getUserFavorites(user.id);
    }
  } catch (err) {
    console.warn('Error getting user:', err);
  }

  const [featuredAds, recentAds] = await Promise.all([
    getFeaturedAds(),
    getRecentAds(),
  ]);

  // Filter ads based on search
  let displayedAds = recentAds;
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    displayedAds = recentAds.filter(
      (ad) =>
        ad.title.toLowerCase().includes(searchLower) ||
        ad.description.toLowerCase().includes(searchLower)
    );
  }

  if (params.category) {
    displayedAds = displayedAds.filter((ad) => ad.category_id === params.category);
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Categories */}
      <Suspense fallback={
        <div className="animate-pulse space-y-4 mb-12">
          <div className="h-8 bg-white/5 rounded-lg w-48"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-32 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      }>
        <CategoryList />
      </Suspense>

      {/* Stats */}
      <StatsSection
        featuredCount={featuredAds.length}
        activeCount={recentAds.length}
        totalViews={recentAds.reduce((sum, ad) => sum + (ad.views_count || 0), 0)}
      />

      {/* Featured Ads */}
      {featuredAds.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                <Zap className="h-5 w-5 text-indigo-400" />
              </div>
              <h2 className="text-3xl font-bold gradient-text">آگهی‌های ویژه</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredAds.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                initialIsFavorite={userFavoriteAdIds.includes(ad.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Ads */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold gradient-text">آگهی‌های جدید</h2>
        </div>
        {displayedAds.length === 0 ? (
          <Card className="glass-effect border-white/10">
            <CardContent className="py-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-indigo-400" />
              </div>
              <p className="text-muted-foreground text-lg">
                {params.search
                  ? `نتیجه‌ای برای "${params.search}" یافت نشد.`
                  : 'در حال حاضر آگهی برای نمایش وجود ندارد.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedAds.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                initialIsFavorite={userFavoriteAdIds.includes(ad.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
