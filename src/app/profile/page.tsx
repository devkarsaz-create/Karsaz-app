import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import ProfileTabs from '@/components/ProfileTabs';

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/profile');
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const activeTab = searchParams.tab || 'ads';

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileTabs
        user={user}
        userProfile={userProfile}
        activeTab={activeTab}
      />
    </div>
  );
}
