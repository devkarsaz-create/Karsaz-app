import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { SearchFilters, AdWithDetails } from '@/types/database.types'

interface SearchState {
  // State
  query: string
  filters: SearchFilters
  results: AdWithDetails[]
  isLoading: boolean
  hasMore: boolean
  total: number
  page: number
  recentSearches: string[]
  suggestions: string[]
  
  // Actions
  setQuery: (query: string) => void
  setFilters: (filters: Partial<SearchFilters>) => void
  setResults: (results: AdWithDetails[]) => void
  appendResults: (results: AdWithDetails[]) => void
  setLoading: (loading: boolean) => void
  setHasMore: (hasMore: boolean) => void
  setTotal: (total: number) => void
  setPage: (page: number) => void
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void
  setSuggestions: (suggestions: string[]) => void
  reset: () => void
  
  // Computed
  hasFilters: () => boolean
  getActiveFiltersCount: () => number
}

const initialFilters: SearchFilters = {
  query: '',
  category: undefined,
  subcategory: undefined,
  location: undefined,
  priceMin: undefined,
  priceMax: undefined,
  condition: undefined,
  priceType: undefined,
  sortBy: 'newest',
  isUrgent: undefined,
  isFeatured: undefined,
  hasImages: undefined,
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      // Initial state
      query: '',
      filters: initialFilters,
      results: [],
      isLoading: false,
      hasMore: true,
      total: 0,
      page: 1,
      recentSearches: [],
      suggestions: [],
      
      // Actions
      setQuery: (query) => set({ query }),
      
      setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters },
        page: 1, // Reset page when filters change
      })),
      
      setResults: (results) => set({ results }),
      
      appendResults: (newResults) => set((state) => ({
        results: [...state.results, ...newResults],
      })),
      
      setLoading: (isLoading) => set({ isLoading }),
      setHasMore: (hasMore) => set({ hasMore }),
      setTotal: (total) => set({ total }),
      setPage: (page) => set({ page }),
      
      addRecentSearch: (query) => {
        if (!query.trim()) return
        
        set((state) => {
          const filtered = state.recentSearches.filter(s => s !== query)
          return {
            recentSearches: [query, ...filtered].slice(0, 10) // Keep only 10 recent searches
          }
        })
      },
      
      clearRecentSearches: () => set({ recentSearches: [] }),
      setSuggestions: (suggestions) => set({ suggestions }),
      
      reset: () => set({
        query: '',
        filters: initialFilters,
        results: [],
        isLoading: false,
        hasMore: true,
        total: 0,
        page: 1,
        suggestions: [],
      }),
      
      // Computed
      hasFilters: () => {
        const { filters } = get()
        return Object.entries(filters).some(([key, value]) => {
          if (key === 'sortBy') return value !== 'newest'
          return value !== undefined && value !== '' && value !== null
        })
      },
      
      getActiveFiltersCount: () => {
        const { filters } = get()
        return Object.entries(filters).filter(([key, value]) => {
          if (key === 'sortBy') return value !== 'newest'
          return value !== undefined && value !== '' && value !== null
        }).length
      },
    }),
    {
      name: 'search-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        recentSearches: state.recentSearches,
        filters: {
          sortBy: state.filters.sortBy,
          // Don't persist other filters as they should reset on app restart
        },
      }),
    }
  )
)