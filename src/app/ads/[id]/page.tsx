import { Ad, User } from '@/lib/supabase';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FavoriteButton from '@/components/FavoriteButton';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { MapPin, Calendar, Eye, Phone, MessageCircle, Share2 } from 'lucide-react';
import Link from 'next/link';
import AdViewTracker from '@/components/AdViewTracker';

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
    .select('*, users(*)')
    .eq('id', adId)
    .single();

  if (adError) {
    console.error('Error fetching ad details:', adError);
    return { ad: null, user: null };
  }

  const ad = adData as unknown as Ad;
  const user = (adData as any).users as User;

  return { ad, user };
}

async function isAdFavorite(userId: string | undefined, adId: string): Promise<boolean> {
  if (!userId) return false;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('ad_id', adId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error checking favorite status:', error);
    return false;
  }
  return !!data;
}

export default async function AdDetailsPage({ params }: AdDetailsPageProps) {
  const supabaseServer = await createSupabaseServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  const { ad, user: adUser } = await getAdDetails(params.id);

  if (!ad) {
    notFound();
  }

  const initialIsFavorite = await isAdFavorite(user?.id, ad.id);

  const imageUrl = ad.images && ad.images.length > 0 ? ad.images[0] : "/placeholder.png";
  const contactInfo = ad.contact_info as any || {};

  return (
    <>
      <AdViewTracker adId={ad.id} userId={user?.id} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Images Gallery */}
          {ad.images && ad.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative w-full h-96 rounded-lg overflow-hidden">
                <Image
                  src={ad.images[0]}
                  alt={ad.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {ad.images.length > 1 && (
                <div className="grid grid-cols-2 gap-4">
                  {ad.images.slice(1, 5).map((img, idx) => (
                    <div key={idx} className="relative w-full h-44 rounded-lg overflow-hidden">
                      <Image
                        src={img}
                        alt={`${ad.title} - ${idx + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-3xl mb-2">{ad.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 text-base">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(ad.created_at).toLocaleDateString("fa-IR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {ad.views_count || 0} بازدید
                        </span>
                      </CardDescription>
                    </div>
                    <FavoriteButton adId={ad.id} initialIsFavorite={initialIsFavorite} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">توضیحات</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {ad.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">قیمت</p>
                      <p className="text-2xl font-bold text-primary">
                        {ad.price
                          ? `${ad.price.toLocaleString()} تومان`
                          : ad.price_type === 'free'
                          ? 'رایگان'
                          : 'قابل مذاکره'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">موقعیت</p>
                      <p className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {ad.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seller Info */}
              <Card>
                <CardHeader>
                  <CardTitle>اطلاعات فروشنده</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold">{adUser?.full_name || adUser?.email}</p>
                    {adUser?.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {adUser.location}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>تماس با فروشنده</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contactInfo.phone && (
                    <Button className="w-full gap-2" variant="outline" asChild>
                      <a href={`tel:${contactInfo.phone}`}>
                        <Phone className="h-4 w-4" />
                        {contactInfo.phone}
                      </a>
                    </Button>
                  )}
                  {contactInfo.whatsapp && (
                    <Button className="w-full gap-2" variant="outline" asChild>
                      <a href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4" />
                        واتساپ
                      </a>
                    </Button>
                  )}
                  {user && user.id !== ad.user_id && (
                    <Link href={`/chat/${ad.id}?userId=${ad.user_id}`}>
                      <Button className="w-full gap-2">
                        <MessageCircle className="h-4 w-4" />
                        ارسال پیام
                      </Button>
                    </Link>
                  )}
                  <Button className="w-full gap-2" variant="outline">
                    <Share2 className="h-4 w-4" />
                    اشتراک‌گذاری
                  </Button>
                </CardContent>
              </Card>

              {ad.is_featured && (
                <Card className="border-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-primary">
                      <span>⭐</span>
                      <span className="font-semibold">آگهی ویژه</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
