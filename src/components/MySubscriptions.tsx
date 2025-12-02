"use client";

import { useState, useEffect } from 'react';
import { createSupabaseClientComponentClient } from '@/lib/supabase-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Crown, Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface MySubscriptionsProps {
  userId: string;
}

interface Subscription {
  id: string;
  plan_id: string;
  plan_type: 'monthly' | 'yearly';
  status: 'active' | 'expired' | 'cancelled';
  starts_at: string;
  expires_at: string;
  subscription_plans: {
    name: string;
    description: string;
  };
}

export default function MySubscriptions({ userId }: MySubscriptionsProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClientComponentClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadSubscriptions();
  }, [userId]);

  const loadSubscriptions = async () => {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*, subscription_plans(name, description)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading subscriptions:', error);
      toast({
        title: "خطا",
        description: "خطا در بارگذاری اشتراک‌ها",
        variant: "destructive",
      });
    } else {
      setSubscriptions(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeSubscription = subscriptions.find(
    (sub) => sub.status === 'active' && new Date(sub.expires_at) > new Date()
  );

  return (
    <div className="space-y-6">
      {activeSubscription ? (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-primary" />
              <CardTitle>اشتراک فعال</CardTitle>
            </div>
            <CardDescription>
              {activeSubscription.subscription_plans.name} -{' '}
              {activeSubscription.plan_type === 'monthly' ? 'ماهانه' : 'سالانه'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">وضعیت:</span>
                <span className="flex items-center gap-1 text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  فعال
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">تاریخ انقضا:</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(activeSubscription.expires_at).toLocaleDateString('fa-IR')}
                </span>
              </div>
              <div className="pt-4 border-t">
                <Link href="/subscription">
                  <Button variant="outline" className="w-full">
                    ارتقا یا تمدید پلن
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>اشتراک فعال ندارید</CardTitle>
            <CardDescription>
              برای استفاده از امکانات ویژه، یک پلن انتخاب کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/subscription">
              <Button className="w-full">مشاهده پلن‌ها</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {subscriptions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">تاریخچه اشتراک‌ها</h3>
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <Card key={subscription.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {subscription.subscription_plans.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {subscription.plan_type === 'monthly' ? 'ماهانه' : 'سالانه'}
                      </p>
                    </div>
                    <div className="text-left">
                      {subscription.status === 'active' ? (
                        <span className="flex items-center gap-1 text-green-500">
                          <CheckCircle className="h-4 w-4" />
                          فعال
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <XCircle className="h-4 w-4" />
                          {subscription.status === 'expired' ? 'منقضی شده' : 'لغو شده'}
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        تا {new Date(subscription.expires_at).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

