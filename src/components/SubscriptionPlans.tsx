"use client";

import { useState, useEffect } from 'react';
import { createSupabaseClientComponentClient } from '@/lib/supabase-client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Check, Crown, Zap, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_ads: number;
  max_images_per_ad: number;
  can_feature: boolean;
  can_urgent: boolean;
  priority_support: boolean;
}

interface SubscriptionPlansProps {
  userId: string;
}

export default function SubscriptionPlans({ userId }: SubscriptionPlansProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [processing, setProcessing] = useState<string | null>(null);
  const supabase = createSupabaseClientComponentClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly');

    if (error) {
      console.error('Error loading plans:', error);
      toast({
        title: "خطا",
        description: "خطا در بارگذاری پلن‌ها",
        variant: "destructive",
      });
    } else {
      setPlans(data || []);
    }
    setLoading(false);
  };

  const handleSubscribe = async (planId: string) => {
    setProcessing(planId);
    
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
    const expiresAt = new Date();
    if (billingCycle === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    try {
      // Create subscription
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          plan_type: billingCycle,
          amount_paid: price,
          expires_at: expiresAt.toISOString(),
          status: 'active',
        })
        .select()
        .single();

      if (subError) throw subError;

      // Create transaction record
      await supabase.from('transactions').insert({
        user_id: userId,
        subscription_id: subscription.id,
        type: 'subscription',
        amount: price,
        status: 'completed',
        payment_method: 'manual', // در آینده با درگاه پرداخت واقعی جایگزین می‌شود
      });

      // Update user premium status
      await supabase
        .from('users')
        .update({
          is_premium: true,
          premium_expires_at: expiresAt.toISOString(),
        })
        .eq('id', userId);

      toast({
        title: "موفقیت",
        description: `پلن ${plan.name} با موفقیت فعال شد!`,
      });

      router.push('/profile?tab=subscription');
      router.refresh();
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در فعال‌سازی پلن",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12">در حال بارگذاری...</div>;
  }

  const getPlanIcon = (index: number) => {
    if (index === 0) return <Gift className="h-6 w-6" />;
    if (index === 1) return <Zap className="h-6 w-6" />;
    return <Crown className="h-6 w-6" />;
  };

  return (
    <div className="space-y-8">
      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border p-1 bg-muted">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ماهانه
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            سالانه
            <span className="mr-1 text-xs text-primary">(۲۰٪ تخفیف)</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
          const monthlyEquivalent = billingCycle === 'yearly' ? price / 12 : price;
          const isPopular = index === 1;

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${isPopular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    محبوب‌ترین
                  </span>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  {getPlanIcon(index)}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">
                    {price === 0 ? 'رایگان' : `${price.toLocaleString()} تومان`}
                  </span>
                  {billingCycle === 'yearly' && price > 0 && (
                    <span className="text-sm text-muted-foreground mr-2">
                      / {Math.round(monthlyEquivalent).toLocaleString()} تومان در ماه
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      {plan.max_ads === 999999 ? 'آگهی نامحدود' : `${plan.max_ads} آگهی`}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{plan.max_images_per_ad} تصویر برای هر آگهی</span>
                  </li>
                  {plan.can_feature && (
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">بالانشین شدن آگهی</span>
                    </li>
                  )}
                  {plan.can_urgent && (
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">آگهی فوری</span>
                    </li>
                  )}
                  {plan.priority_support && (
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">پشتیبانی اولویت‌دار</span>
                    </li>
                  )}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={isPopular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={processing === plan.id || price === 0}
                >
                  {processing === plan.id
                    ? 'در حال پردازش...'
                    : price === 0
                    ? 'پلن فعلی شما'
                    : 'خرید پلن'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

