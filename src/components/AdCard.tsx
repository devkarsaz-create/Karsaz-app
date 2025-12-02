"use client";

import { Ad } from "@/lib/supabase";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import FavoriteButton from './FavoriteButton';
import { motion } from 'framer-motion';
import { MapPin, Eye, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdCardProps {
  ad: Ad;
  initialIsFavorite: boolean;
}

export default function AdCard({ ad, initialIsFavorite }: AdCardProps) {
  const imageUrl = ad.images && ad.images.length > 0 ? ad.images[0] : "/placeholder.png";

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col glass-effect border-white/10 overflow-hidden group hover-lift relative">
        {/* Featured Badge */}
        {ad.is_featured && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold shadow-lg">
            <Sparkles className="h-3 w-3" />
            <span>ویژه</span>
          </div>
        )}

        {/* Favorite Button */}
        <div className="absolute top-3 right-3 z-20">
          <FavoriteButton adId={ad.id} initialIsFavorite={initialIsFavorite} />
        </div>

        {/* Image with Overlay */}
        <Link href={`/ads/${ad.id}`} className="relative block">
          <CardContent className="p-0 relative overflow-hidden">
            <AspectRatio ratio={16 / 9} className="relative">
              <Image
                src={imageUrl}
                alt={ad.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {/* Location Badge */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <MapPin className="h-3 w-3" />
                <span>{ad.location}</span>
              </div>
            </AspectRatio>
          </CardContent>
        </Link>

        {/* Content */}
        <Link href={`/ads/${ad.id}`} className="flex-grow flex flex-col">
          <CardContent className="p-4 flex-grow flex flex-col">
            <h3 className="text-lg font-bold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {ad.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-grow">
              {ad.description}
            </p>
            
            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{ad.views_count || 0}</span>
              </div>
              <span>{new Date(ad.created_at).toLocaleDateString("fa-IR", { month: 'short', day: 'numeric' })}</span>
            </div>
          </CardContent>

          <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-white/5">
            <div className="flex flex-col">
              <span className={cn(
                "text-lg font-bold",
                ad.price ? "gradient-text" : "text-muted-foreground"
              )}>
                {ad.price 
                  ? `${ad.price.toLocaleString()} تومان` 
                  : ad.price_type === 'free' 
                    ? 'رایگان' 
                    : 'قابل مذاکره'}
              </span>
              {ad.price_type === 'negotiable' && ad.price && (
                <span className="text-xs text-muted-foreground">قابل مذاکره</span>
              )}
            </div>
          </CardFooter>
        </Link>
      </Card>
    </motion.div>
  );
}
