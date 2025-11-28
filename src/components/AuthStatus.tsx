// src/components/AuthStatus.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClientComponentClient } from '@/lib/supabase-client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';

export default function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createSupabaseClientComponentClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  if (user) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm">خوش آمدید، {user.email}</span>
        <Button variant="ghost" onClick={handleLogout}>
          خروج
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" onClick={() => router.push("/login")}>
        ورود
      </Button>
      <Button onClick={() => router.push("/signup")}>
        ثبت نام
      </Button>
    </div>
  );
}
