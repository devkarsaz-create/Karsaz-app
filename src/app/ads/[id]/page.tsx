// src/app/ads/[id]/page.tsx
import { Ad, User } from '@/lib/supabase';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FavoriteButton from '@/components/FavoriteButton';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AdDetailsPageProps {
  params: { id: string };
}

async function getAdDetails(adId: string): Promise<{ ad: Ad | null; user: User | null }> {
  const { data: adData, error: adError } = await supabaseClient
    .from('ads')
    .select('*, users(*)') // Select ad and join with user details
    .eq('id', adId)
    .single();

  if (adError) {
    console.error('Error fetching ad details:', adError);
    return { ad: null, user: null };
  }

  const ad = adData as unknown as Ad; // Type assertion
  const user = adData.users as User; // User data is nested within adData

  return { ad, user };
}

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

export default async function AdDetailsPage({ params }: AdDetailsPageProps) {
  const supabaseServer = createSupabaseServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  const { ad, user: adUser } = await getAdDetails(params.id);

  if (!ad) {
    notFound();
  }

  const initialIsFavorite = await isAdFavorite(user?.id, ad.id);

  const imageUrl = ad.images && ad.images.length > 0 ? ad.images[0] : "/placeholder.png";

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{ad.title}</CardTitle>
          <CardDescription className="text-gray-400">
            منتشر شده توسط {adUser?.full_name || adUser?.email} در {new Date(ad.created_at).toLocaleDateString("fa-IR")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative w-full h-80 rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={ad.title}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">توضیحات</h3>
            <p className="text-gray-300">{ad.description}</p>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-primary">
              {ad.price ? `${ad.price.toLocaleString()} تومان` : "تماس بگیرید"}
            </span>
            <FavoriteButton adId={ad.id} initialIsFavorite={initialIsFavorite} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline">تماس</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
