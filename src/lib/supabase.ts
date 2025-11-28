// Types for our database
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  phone?: string
  location?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  icon: string
  parent_id?: string
  created_at: string
}

export interface Ad {
  id: string
  title: string
  description: string
  price?: number
  price_type: 'fixed' | 'negotiable' | 'free'
  category_id: string
  subcategory_id?: string
  user_id: string
  location: string
  images?: string[]
  contact_info: {
    phone?: string
    email?: string
    telegram?: string
    whatsapp?: string
  }
  is_urgent: boolean
  is_featured: boolean
  status: 'active' | 'sold' | 'expired' | 'draft'
  views_count: number
  created_at: string
  updated_at: string
  expires_at?: string
}

export interface Message {
  id: string
  ad_id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  ad_id: string
  created_at: string
}
