import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import SubscriptionPlans from '@/components/SubscriptionPlans';

export default async function SubscriptionPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/subscription');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          پلن‌های اشتراک
        </h1>
        <p className="text-muted-foreground text-lg">
          پلن مناسب خود را انتخاب کنید و از امکانات ویژه بهره‌مند شوید
        </p>
      </div>
      <SubscriptionPlans userId={user.id} />
    </div>
  );
}

