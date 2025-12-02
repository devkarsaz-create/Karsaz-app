"use client";

import { useEffect } from 'react';
import { createSupabaseClientComponentClient } from '@/lib/supabase-client';

interface AdViewTrackerProps {
  adId: string;
  userId?: string;
}

export default function AdViewTracker({ adId, userId }: AdViewTrackerProps) {
  const supabase = createSupabaseClientComponentClient();

  useEffect(() => {
    const trackView = async () => {
      // Get IP address (simplified - in production use a proper service)
      const ipAddress = 'unknown'; // You can use a service to get real IP

      // Check if view already recorded today
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existingView } = await supabase
        .from('ad_views')
        .select('id')
        .eq('ad_id', adId)
        .eq('user_id', userId || 'null')
        .gte('viewed_at', `${today}T00:00:00`)
        .lte('viewed_at', `${today}T23:59:59`)
        .single();

      if (!existingView) {
        await supabase.from('ad_views').insert({
          ad_id: adId,
          user_id: userId || null,
          ip_address: ipAddress,
        });
      }
    };

    trackView();
  }, [adId, userId, supabase]);

  return null;
}

