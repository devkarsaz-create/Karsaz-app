import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  phone?: string
  phoneVerified?: string
  location?: string
  bio?: string
  isVerified: boolean
  isPremium: boolean
  role: string
  subscriptionType: string
  subscriptionExpiresAt?: string
  settings?: any
  socialLinks?: any
  rating?: number
  totalRatings: number
  createdAt: string
  updatedAt: string
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

interface AuthState {
  // State
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  isInitialized: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setTokens: (tokens: AuthTokens | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  signOut: () => void
  
  // Computed
  isAuthenticated: () => boolean
  isPremium: () => boolean
  isVerified: () => boolean
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isLoading: true,
      isInitialized: false,
      
      // Actions
      setUser: (user) => set({ user }),
      setTokens: (tokens) => set({ tokens }),
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      
      signOut: () => set({ 
        user: null, 
        tokens: null, 
        isLoading: false 
      }),
      
      // Computed
      isAuthenticated: () => {
        const { user, tokens } = get()
        return !!(user && tokens?.accessToken)
      },
      
      isPremium: () => {
        const { user } = get()
        return user?.isPremium || false
      },
      
      isVerified: () => {
        const { user } = get()
        return user?.isVerified || false
      },
      
      isAdmin: () => {
        const { user } = get()
        return user?.role === 'ADMIN'
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
      }),
    }
  )
)