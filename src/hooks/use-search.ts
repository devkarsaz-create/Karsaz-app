import { useCallback, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useSearchStore } from '@/stores/search-store'
import { useUIStore } from '@/stores/ui-store'
import { SearchFilters, AdWithDetails } from '@/types/database.types'
import { debounce } from '@/lib/utils'
import { PAGINATION_CONFIG, SEARCH_CONFIG } from '@/constants'

export function useSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const {
    query,
    filters,
    results,
    isLoading,
    hasMore,
    total,
    page,
    recentSearches,
    suggestions,
    setQuery,
    setFilters,
    setResults,
    appendResults,
    setLoading,
    setHasMore,
    setTotal,
    setPage,
    addRecentSearch,
    clearRecentSearches,
    setSuggestions,
    reset,
    hasFilters,
    getActiveFiltersCount,
  } = useSearchStore()
  
  const { addNotification } = useUIStore()

  // Sync URL params with store
  useEffect(() => {
    const urlQuery = searchParams.get('q') || ''
    const urlCategory = searchParams.get('category') || undefined
    const urlLocation = searchParams.get('location') || undefined
    const urlPriceMin = searchParams.get('price_min') ? Number(searchParams.get('price_min')) : undefined
    const urlPriceMax = searchParams.get('price_max') ? Number(searchParams.get('price_max')) : undefined
    const urlSortBy = (searchParams.get('sort') as SearchFilters['sortBy']) || 'newest'

    setQuery(urlQuery)
    setFilters({
      query: urlQuery,
      category: urlCategory,
      location: urlLocation,
      priceMin: urlPriceMin,
      priceMax: urlPriceMax,
      sortBy: urlSortBy,
    })
  }, [searchParams])

  // Update URL when search state changes
  const updateURL = useCallback((newQuery: string, newFilters: Partial<SearchFilters>) => {
    const params = new URLSearchParams()
    
    if (newQuery) params.set('q', newQuery)
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.location) params.set('location', newFilters.location)
    if (newFilters.priceMin) params.set('price_min', newFilters.priceMin.toString())
    if (newFilters.priceMax) params.set('price_max', newFilters.priceMax.toString())
    if (newFilters.sortBy && newFilters.sortBy !== 'newest') params.set('sort', newFilters.sortBy)

    const url = params.toString() ? `/search?${params.toString()}` : '/search'
    router.push(url, { scroll: false })
  }, [router])

  // Perform search
  const performSearch = useCallback(async (
    searchQuery: string = query,
    searchFilters: SearchFilters = filters,
    pageNum: number = 1,
    append: boolean = false
  ) => {
    try {
      setLoading(true)

      // Call the search function
      const { data, error } = await supabase.rpc('search_ads', {
        search_query: searchQuery,
        category_filter: searchFilters.category || null,
        location_filter: searchFilters.location || null,
        price_min: searchFilters.priceMin || null,
        price_max: searchFilters.priceMax || null,
        condition_filter: searchFilters.condition || null,
        price_type_filter: searchFilters.priceType || null,
        sort_by: searchFilters.sortBy || 'newest',
        limit_count: PAGINATION_CONFIG.defaultLimit,
        offset_count: (pageNum - 1) * PAGINATION_CONFIG.defaultLimit,
      })

      if (error) {
        console.error('Search error:', error)
        addNotification({
          type: 'error',
          title: 'خطا در جستجو',
          message: 'خطایی در جستجو رخ داد. لطفاً دوباره تلاش کنید.',
        })
        return
      }

      const searchResults = data || []
      
      if (append) {
        appendResults(searchResults)
      } else {
        setResults(searchResults)
      }

      setHasMore(searchResults.length === PAGINATION_CONFIG.defaultLimit)
      setPage(pageNum)

      // Add to recent searches if it's a new search with query
      if (searchQuery && !append && pageNum === 1) {
        addRecentSearch(searchQuery)
      }

    } catch (error) {
      console.error('Search error:', error)
      addNotification({
        type: 'error',
        title: 'خطا در جستجو',
        message: 'خطای غیرمنتظره‌ای رخ داد.',
      })
    } finally {
      setLoading(false)
    }
  }, [query, filters, supabase, addNotification])

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((searchQuery: string, searchFilters: SearchFilters) => {
      performSearch(searchQuery, searchFilters, 1, false)
    }, SEARCH_CONFIG.debounceDelay),
    [performSearch]
  )

  // Search with query
  const search = useCallback((newQuery: string, newFilters: Partial<SearchFilters> = {}) => {
    const updatedFilters = { ...filters, ...newFilters, query: newQuery }
    setQuery(newQuery)
    setFilters(newFilters)
    updateURL(newQuery, updatedFilters)
    debouncedSearch(newQuery, updatedFilters)
  }, [filters, setQuery, setFilters, updateURL, debouncedSearch])

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(newFilters)
    updateURL(query, updatedFilters)
    performSearch(query, updatedFilters, 1, false)
  }, [filters, query, setFilters, updateURL, performSearch])

  // Load more results
  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return
    performSearch(query, filters, page + 1, true)
  }, [hasMore, isLoading, query, filters, page, performSearch])

  // Get search suggestions
  const getSuggestions = useCallback(async (partialQuery: string) => {
    if (partialQuery.length < SEARCH_CONFIG.minQueryLength) {
      setSuggestions([])
      return
    }

    try {
      const { data, error } = await supabase.rpc('suggest_search_terms', {
        partial_query: partialQuery,
        limit_count: SEARCH_CONFIG.maxSuggestions,
      })

      if (error) {
        console.error('Suggestions error:', error)
        return
      }

      setSuggestions(data?.map((item: any) => item.suggestion) || [])
    } catch (error) {
      console.error('Suggestions error:', error)
    }
  }, [supabase, setSuggestions])

  // Debounced suggestions
  const debouncedGetSuggestions = useMemo(
    () => debounce(getSuggestions, SEARCH_CONFIG.debounceDelay),
    [getSuggestions]
  )

  // Clear search
  const clearSearch = useCallback(() => {
    reset()
    router.push('/search')
  }, [reset, router])

  // Get trending searches
  const getTrendingSearches = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_trending_categories', {
        days_back: 7,
        limit_count: 10,
      })

      if (error) {
        console.error('Trending searches error:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Trending searches error:', error)
      return []
    }
  }, [supabase])

  // Get popular locations
  const getPopularLocations = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_popular_locations', {
        limit_count: 20,
      })

      if (error) {
        console.error('Popular locations error:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Popular locations error:', error)
      return []
    }
  }, [supabase])

  // Search by category
  const searchByCategory = useCallback((categoryId: string, categoryName: string) => {
    search('', { category: categoryId })
    addRecentSearch(categoryName)
  }, [search, addRecentSearch])

  // Search by location
  const searchByLocation = useCallback((location: string) => {
    search('', { location })
    addRecentSearch(location)
  }, [search, addRecentSearch])

  return {
    // State
    query,
    filters,
    results,
    isLoading,
    hasMore,
    total,
    page,
    recentSearches,
    suggestions,
    
    // Computed
    hasFilters: hasFilters(),
    activeFiltersCount: getActiveFiltersCount(),
    hasResults: results.length > 0,
    isEmpty: !isLoading && results.length === 0,
    
    // Actions
    search,
    updateFilters,
    loadMore,
    clearSearch,
    getSuggestions: debouncedGetSuggestions,
    clearRecentSearches,
    searchByCategory,
    searchByLocation,
    
    // Async actions
    getTrendingSearches,
    getPopularLocations,
  }
}