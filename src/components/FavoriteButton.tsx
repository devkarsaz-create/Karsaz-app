// src/components/FavoriteButton.tsx
"use client";

import { useState, useEffect } from 'react';
import { createSupabaseClientComponentClient } from '@/lib/supabase-client';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FavoriteButtonProps {
  adId: string;
  initialIsFavorite: boolean;
}

export default function FavoriteButton({ adId, initialIsFavorite }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseClientComponentClient();

  const handleToggleFavorite = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("برای افزودن به علاقه‌مندی‌ها باید وارد شوید.");
      setLoading(false);
      return;
    }

    if (isFavorite) {
      // Remove from favorites
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('ad_id', adId);

      if (error) console.error('Error removing from favorites:', error);
      else setIsFavorite(false);
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, ad_id: adId });

      if (error) console.error('Error adding to favorites:', error);
      else setIsFavorite(true);
    }
    setLoading(false);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleFavorite}
      disabled={loading}
      className={isFavorite ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-gray-400"}
    >
      <Heart fill={isFavorite ? "currentColor" : "none"} />
    </Button>
  );
}
