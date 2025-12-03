export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  parentId: string | null;
  createdAt: string; 
}

export interface Ad {
    id: string;
    title: string;
    description: string;
    price?: number | null;
    priceType: string;
    images: string[];
    location: string;
    views_count?: number;
    created_at: string; 
    is_featured?: boolean;
    category_id: string;
    userId: string;
}
