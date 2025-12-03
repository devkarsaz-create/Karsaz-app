import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AdWithDetails } from '@/types/database.types'

interface FavoritesState {
  // State
  favoriteIds: Set<string>
  favorites: AdWithDetails[]
  isLoading: boolean
  
  // Actions
  addFavorite: (adId: string) => void
  removeFavorite: (adId: string) => void
  setFavorites: (favorites: AdWithDetails[]) => void
  setFavoriteIds: (ids: string[]) => void
  setLoading: (loading: boolean) => void
  toggleFavorite: (adId: string) => void
  clearFavorites: () => void
  
  // Computed
  isFavorite: (adId: string) => boolean
  getFavoritesCount: () => number
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // Initial state
      favoriteIds: new Set<string>(),
      favorites: [],
      isLoading: false,
      
      // Actions
      addFavorite: (adId) => set((state) => ({
        favoriteIds: new Set([...state.favoriteIds, adId])
      })),
      
      removeFavorite: (adId) => set((state) => {
        const newFavoriteIds = new Set(state.favoriteIds)
        newFavoriteIds.delete(adId)
        return {
          favoriteIds: newFavoriteIds,
          favorites: state.favorites.filter(fav => fav.id !== adId)
        }
      }),
      
      setFavorites: (favorites) => set({ favorites }),
      
      setFavoriteIds: (ids) => set({
        favoriteIds: new Set(ids)
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      toggleFavorite: (adId) => {
        const { isFavorite, addFavorite, removeFavorite } = get()
        if (isFavorite(adId)) {
          removeFavorite(adId)
        } else {
          addFavorite(adId)
        }
      },
      
      clearFavorites: () => set({
        favoriteIds: new Set<string>(),
        favorites: []
      }),
      
      // Computed
      isFavorite: (adId) => {
        const { favoriteIds } = get()
        return favoriteIds.has(adId)
      },
      
      getFavoritesCount: () => {
        const { favoriteIds } = get()
        return favoriteIds.size
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favoriteIds: Array.from(state.favoriteIds), // Convert Set to Array for serialization
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.favoriteIds)) {
          // Convert Array back to Set after rehydration
          state.favoriteIds = new Set(state.favoriteIds)
        }
      },
    }
  )
)