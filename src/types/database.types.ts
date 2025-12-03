export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          location: string | null
          bio: string | null
          is_verified: boolean
          is_premium: boolean
          subscription_type: 'free' | 'basic' | 'premium' | null
          subscription_expires_at: string | null
          created_at: string
          updated_at: string
          last_seen_at: string | null
          settings: Json | null
          social_links: Json | null
          rating: number | null
          total_ratings: number | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          location?: string | null
          bio?: string | null
          is_verified?: boolean
          is_premium?: boolean
          subscription_type?: 'free' | 'basic' | 'premium' | null
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
          last_seen_at?: string | null
          settings?: Json | null
          social_links?: Json | null
          rating?: number | null
          total_ratings?: number | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          location?: string | null
          bio?: string | null
          is_verified?: boolean
          is_premium?: boolean
          subscription_type?: 'free' | 'basic' | 'premium' | null
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
          last_seen_at?: string | null
          settings?: Json | null
          social_links?: Json | null
          rating?: number | null
          total_ratings?: number | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          name_en: string | null
          slug: string
          icon: string
          color: string | null
          parent_id: string | null
          level: number
          sort_order: number
          is_active: boolean
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_en?: string | null
          slug: string
          icon: string
          color?: string | null
          parent_id?: string | null
          level?: number
          sort_order?: number
          is_active?: boolean
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_en?: string | null
          slug?: string
          icon?: string
          color?: string | null
          parent_id?: string | null
          level?: number
          sort_order?: number
          is_active?: boolean
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      ads: {
        Row: {
          id: string
          title: string
          description: string
          price: number | null
          price_type: 'fixed' | 'negotiable' | 'free' | 'contact'
          currency: string
          category_id: string
          subcategory_id: string | null
          user_id: string
          location: string
          coordinates: Json | null
          images: string[] | null
          video_url: string | null
          contact_info: Json
          specifications: Json | null
          condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor' | null
          brand: string | null
          model: string | null
          year: number | null
          is_urgent: boolean
          is_featured: boolean
          is_promoted: boolean
          featured_until: string | null
          promoted_until: string | null
          status: 'draft' | 'active' | 'sold' | 'expired' | 'suspended' | 'deleted'
          views_count: number
          favorites_count: number
          messages_count: number
          boost_score: number
          quality_score: number
          search_vector: unknown | null
          tags: string[] | null
          external_id: string | null
          source: string | null
          created_at: string
          updated_at: string
          published_at: string | null
          expires_at: string | null
          sold_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          price?: number | null
          price_type?: 'fixed' | 'negotiable' | 'free' | 'contact'
          currency?: string
          category_id: string
          subcategory_id?: string | null
          user_id: string
          location: string
          coordinates?: Json | null
          images?: string[] | null
          video_url?: string | null
          contact_info: Json
          specifications?: Json | null
          condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor' | null
          brand?: string | null
          model?: string | null
          year?: number | null
          is_urgent?: boolean
          is_featured?: boolean
          is_promoted?: boolean
          featured_until?: string | null
          promoted_until?: string | null
          status?: 'draft' | 'active' | 'sold' | 'expired' | 'suspended' | 'deleted'
          views_count?: number
          favorites_count?: number
          messages_count?: number
          boost_score?: number
          quality_score?: number
          search_vector?: unknown | null
          tags?: string[] | null
          external_id?: string | null
          source?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
          expires_at?: string | null
          sold_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number | null
          price_type?: 'fixed' | 'negotiable' | 'free' | 'contact'
          currency?: string
          category_id?: string
          subcategory_id?: string | null
          user_id?: string
          location?: string
          coordinates?: Json | null
          images?: string[] | null
          video_url?: string | null
          contact_info?: Json
          specifications?: Json | null
          condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor' | null
          brand?: string | null
          model?: string | null
          year?: number | null
          is_urgent?: boolean
          is_featured?: boolean
          is_promoted?: boolean
          featured_until?: string | null
          promoted_until?: string | null
          status?: 'draft' | 'active' | 'sold' | 'expired' | 'suspended' | 'deleted'
          views_count?: number
          favorites_count?: number
          messages_count?: number
          boost_score?: number
          quality_score?: number
          search_vector?: unknown | null
          tags?: string[] | null
          external_id?: string | null
          source?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
          expires_at?: string | null
          sold_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          ad_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ad_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ad_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          ad_id: string
          sender_id: string
          receiver_id: string
          content: string
          message_type: 'text' | 'image' | 'file' | 'location' | 'contact'
          attachments: Json | null
          is_read: boolean
          is_system: boolean
          reply_to_id: string | null
          created_at: string
          updated_at: string
          read_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          ad_id: string
          sender_id: string
          receiver_id: string
          content: string
          message_type?: 'text' | 'image' | 'file' | 'location' | 'contact'
          attachments?: Json | null
          is_read?: boolean
          is_system?: boolean
          reply_to_id?: string | null
          created_at?: string
          updated_at?: string
          read_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          ad_id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          message_type?: 'text' | 'image' | 'file' | 'location' | 'contact'
          attachments?: Json | null
          is_read?: boolean
          is_system?: boolean
          reply_to_id?: string | null
          created_at?: string
          updated_at?: string
          read_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      conversations: {
        Row: {
          id: string
          ad_id: string
          buyer_id: string
          seller_id: string
          status: 'active' | 'archived' | 'blocked'
          last_message_id: string | null
          last_message_at: string | null
          unread_count_buyer: number
          unread_count_seller: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ad_id: string
          buyer_id: string
          seller_id: string
          status?: 'active' | 'archived' | 'blocked'
          last_message_id?: string | null
          last_message_at?: string | null
          unread_count_buyer?: number
          unread_count_seller?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ad_id?: string
          buyer_id?: string
          seller_id?: string
          status?: 'active' | 'archived' | 'blocked'
          last_message_id?: string | null
          last_message_at?: string | null
          unread_count_buyer?: number
          unread_count_seller?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_last_message_id_fkey"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      ad_views: {
        Row: {
          id: string
          ad_id: string
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ad_id: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ad_id?: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          session_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_views_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: 'basic' | 'premium'
          status: 'active' | 'canceled' | 'expired' | 'past_due'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          payment_method: string | null
          amount: number
          currency: string
          interval: 'month' | 'year'
          trial_start: string | null
          trial_end: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: 'basic' | 'premium'
          status?: 'active' | 'canceled' | 'expired' | 'past_due'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          payment_method?: string | null
          amount: number
          currency?: string
          interval?: 'month' | 'year'
          trial_start?: string | null
          trial_end?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: 'basic' | 'premium'
          status?: 'active' | 'canceled' | 'expired' | 'past_due'
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          payment_method?: string | null
          amount?: number
          currency?: string
          interval?: 'month' | 'year'
          trial_start?: string | null
          trial_end?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json | null
          is_read: boolean
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_user_id: string | null
          reported_ad_id: string | null
          type: 'spam' | 'inappropriate' | 'fake' | 'scam' | 'other'
          reason: string
          description: string | null
          status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          admin_notes: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_user_id?: string | null
          reported_ad_id?: string | null
          type: 'spam' | 'inappropriate' | 'fake' | 'scam' | 'other'
          reason: string
          description?: string | null
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_user_id?: string | null
          reported_ad_id?: string | null
          type?: 'spam' | 'inappropriate' | 'fake' | 'scam' | 'other'
          reason?: string
          description?: string | null
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_ad_id_fkey"
            columns: ["reported_ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_ads: {
        Args: {
          search_query: string
          category_filter?: string
          location_filter?: string
          price_min?: number
          price_max?: number
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          title: string
          description: string
          price: number | null
          price_type: string
          category_id: string
          user_id: string
          location: string
          images: string[] | null
          is_featured: boolean
          status: string
          views_count: number
          favorites_count: number
          created_at: string
          rank: number
        }[]
      }
      get_ad_recommendations: {
        Args: {
          ad_id: string
          limit_count?: number
        }
        Returns: {
          id: string
          title: string
          price: number | null
          images: string[] | null
          similarity_score: number
        }[]
      }
      increment_ad_views: {
        Args: {
          ad_id: string
          user_id?: string
          ip_address?: string
          user_agent?: string
        }
        Returns: void
      }
      get_user_stats: {
        Args: {
          user_id: string
        }
        Returns: {
          total_ads: number
          active_ads: number
          sold_ads: number
          total_views: number
          total_favorites: number
          total_messages: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types
export type User = Tables<'users'>
export type Category = Tables<'categories'>
export type Ad = Tables<'ads'>
export type Favorite = Tables<'favorites'>
export type Message = Tables<'messages'>
export type Conversation = Tables<'conversations'>
export type AdView = Tables<'ad_views'>
export type Subscription = Tables<'subscriptions'>
export type Notification = Tables<'notifications'>
export type Report = Tables<'reports'>

// Insert types
export type UserInsert = TablesInsert<'users'>
export type CategoryInsert = TablesInsert<'categories'>
export type AdInsert = TablesInsert<'ads'>
export type FavoriteInsert = TablesInsert<'favorites'>
export type MessageInsert = TablesInsert<'messages'>
export type ConversationInsert = TablesInsert<'conversations'>
export type AdViewInsert = TablesInsert<'ad_views'>
export type SubscriptionInsert = TablesInsert<'subscriptions'>
export type NotificationInsert = TablesInsert<'notifications'>
export type ReportInsert = TablesInsert<'reports'>

// Update types
export type UserUpdate = TablesUpdate<'users'>
export type CategoryUpdate = TablesUpdate<'categories'>
export type AdUpdate = TablesUpdate<'ads'>
export type FavoriteUpdate = TablesUpdate<'favorites'>
export type MessageUpdate = TablesUpdate<'messages'>
export type ConversationUpdate = TablesUpdate<'conversations'>
export type AdViewUpdate = TablesUpdate<'ad_views'>
export type SubscriptionUpdate = TablesUpdate<'subscriptions'>
export type NotificationUpdate = TablesUpdate<'notifications'>
export type ReportUpdate = TablesUpdate<'reports'>

// Extended types with relations
export type AdWithDetails = Ad & {
  category: Category
  subcategory?: Category
  user: Pick<User, 'id' | 'full_name' | 'avatar_url' | 'is_verified' | 'rating'>
  is_favorite?: boolean
}

export type ConversationWithDetails = Conversation & {
  ad: Pick<Ad, 'id' | 'title' | 'images' | 'price' | 'status'>
  buyer: Pick<User, 'id' | 'full_name' | 'avatar_url'>
  seller: Pick<User, 'id' | 'full_name' | 'avatar_url'>
  last_message?: Pick<Message, 'id' | 'content' | 'created_at' | 'sender_id'>
}

export type MessageWithDetails = Message & {
  sender: Pick<User, 'id' | 'full_name' | 'avatar_url'>
  reply_to?: Pick<Message, 'id' | 'content' | 'sender_id'>
}

// Search and filter types
export type SearchFilters = {
  query?: string
  category?: string
  subcategory?: string
  location?: string
  priceMin?: number
  priceMax?: number
  condition?: Ad['condition']
  priceType?: Ad['price_type']
  sortBy?: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'most_viewed' | 'most_relevant'
  isUrgent?: boolean
  isFeatured?: boolean
  hasImages?: boolean
}

export type SearchResult = {
  ads: AdWithDetails[]
  total: number
  hasMore: boolean
  filters: {
    categories: Array<{ id: string; name: string; count: number }>
    locations: Array<{ name: string; count: number }>
    priceRange: { min: number; max: number }
  }
}

// API Response types
export type ApiResponse<T = any> = {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export type PaginatedResponse<T = any> = ApiResponse<T> & {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Form types
export type AdFormData = Omit<AdInsert, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'views_count' | 'favorites_count' | 'messages_count' | 'boost_score' | 'quality_score' | 'search_vector'>

export type UserProfileFormData = Pick<User, 'full_name' | 'phone' | 'location' | 'bio' | 'social_links'>

export type MessageFormData = Pick<MessageInsert, 'content' | 'message_type' | 'attachments'>

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>