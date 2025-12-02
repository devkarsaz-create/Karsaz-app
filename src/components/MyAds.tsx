"use client";

import { useState, useEffect } from 'react';
import { createSupabaseClientComponentClient } from '@/lib/supabase-client';
import { Ad } from '@/lib/supabase';
import AdCard from './AdCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Edit, Trash2, Eye, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface MyAdsProps {
  userId: string;
}

export default function MyAds({ userId }: MyAdsProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const supabase = createSupabaseClientComponentClient();
  const { toast } = useToast();

  useEffect(() => {
    loadAds();
  }, [userId]);

  const loadAds = async () => {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading ads:', error);
      toast({
        title: "خطا",
        description: "خطا در بارگذاری آگهی‌ها",
        variant: "destructive",
      });
    } else {
      setAds(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (adId: string) => {
    setDeleting(adId);
    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', adId)
      .eq('user_id', userId);

    if (error) {
      toast({
        title: "خطا",
        description: "خطا در حذف آگهی",
        variant: "destructive",
      });
    } else {
      toast({
        title: "موفقیت",
        description: "آگهی با موفقیت حذف شد",
      });
      setAds(ads.filter(ad => ad.id !== adId));
    }
    setDeleting(null);
  };

  const handleFeature = async (adId: string) => {
    // Check if user has premium subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!subscription || !subscription.subscription_plans?.can_feature) {
      toast({
        title: "نیاز به پلن پرمیوم",
        description: "برای بالانشین شدن آگهی نیاز به پلن پرمیوم دارید",
        variant: "destructive",
      });
      return;
    }

    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + 7); // 7 days

    const { error } = await supabase
      .from('ads')
      .update({
        is_featured: true,
        featured_until: featuredUntil.toISOString(),
      })
      .eq('id', adId)
      .eq('user_id', userId);

    if (error) {
      toast({
        title: "خطا",
        description: "خطا در بالانشین شدن آگهی",
        variant: "destructive",
      });
    } else {
      toast({
        title: "موفقیت",
        description: "آگهی شما بالانشین شد",
      });
      loadAds();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">شما تا کنون آگهی ثبت نکرده‌اید.</p>
          <Link href="/new-ad">
            <Button>ثبت اولین آگهی</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">آگهی‌های من ({ads.length})</h2>
        <Link href="/new-ad">
          <Button>+ ثبت آگهی جدید</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {ads.map((ad) => (
          <div key={ad.id} className="relative group">
            <AdCard ad={ad} initialIsFavorite={false} />
            <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link href={`/ads/${ad.id}/edit`}>
                <Button variant="secondary" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    disabled={deleting === ad.id}
                  >
                    {deleting === ad.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>حذف آگهی</AlertDialogTitle>
                    <AlertDialogDescription>
                      آیا از حذف این آگهی مطمئن هستید؟ این عمل غیرقابل بازگشت است.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>انصراف</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(ad.id)}>
                      حذف
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {!ad.is_featured && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFeature(ad.id)}
                  title="بالانشین شدن"
                >
                  <TrendingUp className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="absolute bottom-2 left-2 flex items-center gap-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
              <Eye className="h-3 w-3" />
              <span>{ad.views_count || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

