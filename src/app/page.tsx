import { Suspense } from 'react';
import { Ad } from '@/types';
import { getFeaturedAds, getRecentAds, getUserFavorites } from '@/lib/api';
import AdCard from '@/components/AdCard';
import CategoryList from '@/components/CategoryList';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Sparkles } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';

// NOTE: User auth functionality is temporarily disabled pending backend integration.

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;

  // Fetching data from our new API layer
  const [featuredAds, recentAds] = await Promise.all([
    getFeaturedAds(),
    getRecentAds(),
  ]);

  // This part is a placeholder for now. 
  // Once auth is ready, we will fetch the real user and their favorites.
  const user = null; 
  const userFavoriteAdIds: string[] = user ? await getUserFavorites(user.id) : [];

  // --- Filtering Logic ---
  let displayedAds = recentAds;

  if (category) {
    displayedAds = displayedAds.filter((ad) => ad.category_id === category);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    displayedAds = displayedAds.filter(
      (ad) =>
        ad.title.toLowerCase().includes(searchLower) ||
        ad.description.toLowerCase().includes(searchLower)
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <HeroSection />

      <Suspense fallback={<CategoryListSkeleton />}>
        <CategoryList />
      </Suspense>

      <StatsSection
        featuredCount={featuredAds.length}
        activeCount={recentAds.length}
        totalViews={recentAds.reduce((sum, ad) => sum + (ad.views_count || 0), 0)}
      />

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

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold gradient-text">آگهی‌های جدید</h2>
        </div>
        {displayedAds.length === 0 ? (
          <NoResultsCard search={search} />
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

function CategoryListSkeleton() {
  return (
    <div className="animate-pulse space-y-4 mb-12">
      <div className="h-8 bg-white/5 rounded-lg w-48"></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-32 bg-white/5 rounded-xl"></div>
        ))}
      </div>
    </div>
  )
}

function NoResultsCard({ search }: { search?: string }) {
  return (
    <Card className="glass-effect border-white/10">
      <CardContent className="py-16 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
          <Sparkles className="h-12 w-12 text-indigo-400" />
        </div>
        <p className="text-muted-foreground text-lg">
          {search
            ? `نتیجه‌ای برای "${search}" یافت نشد.`
            : 'در حال حاضر آگهی برای نمایش وجود ندارد.'}
        </p>
      </CardContent>
    </Card>
  )
}
