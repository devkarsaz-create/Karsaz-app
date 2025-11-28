// src/components/AdCard.tsx
"use client";

import { Ad } from "@/lib/supabase";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import FavoriteButton from './FavoriteButton';

interface AdCardProps {
  ad: Ad;
  initialIsFavorite: boolean;
}

export default function AdCard({ ad, initialIsFavorite }: AdCardProps) {
  const imageUrl = ad.images && ad.images.length > 0 ? ad.images[0] : "/placeholder.png"; // Use a placeholder image if no images

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 ease-in-out relative">
      <Link href={`/ads/${ad.id}`}>
        <CardHeader className="p-0">
          <AspectRatio ratio={16 / 9}>
            <Image
              src={imageUrl}
              alt={ad.title}
              fill
              className="rounded-t-lg object-cover"
            />
          </AspectRatio>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-bold line-clamp-2 mb-2">{ad.title}</CardTitle>
          <p className="text-sm text-gray-400 line-clamp-3">{ad.description}</p>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <span className="text-md font-semibold text-primary">
          {ad.price ? `${ad.price.toLocaleString()} تومان` : "تماس بگیرید"}
        </span>
        <span className="text-xs text-gray-500">{new Date(ad.created_at).toLocaleDateString("fa-IR")}</span>
      </CardFooter>
      <div className="absolute top-2 right-2">
        <FavoriteButton adId={ad.id} initialIsFavorite={initialIsFavorite} />
      </div>
    </Card>
  );
}
