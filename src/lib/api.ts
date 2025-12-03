import { Category, Ad } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchFromApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'An unknown API error occurred');
  }

  // Handle cases with no content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// CATEGORY API
export async function getCategories(): Promise<Category[]> {
    try {
        const data = await fetchFromApi<{ categories: Category[] }>('v1/categories');
        return data.categories || [];
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return []; // Return empty array on error
    }
}

// ADS API
export async function getFeaturedAds(): Promise<Ad[]> {
  try {
    const data = await fetchFromApi<{ ads: Ad[] }>('v1/ads?featured=true&limit=8');
    return data.ads || [];
  } catch (error) {
    console.error("Failed to fetch featured ads:", error);
    return [];
  }
}

export async function getRecentAds(): Promise<Ad[]> {
  try {
    const data = await fetchFromApi<{ ads: Ad[] }>('v1/ads?limit=20');
    return data.ads || [];
  } catch (error) {
    console.error("Failed to fetch recent ads:", error);
    return [];
  }
}

// USER API (Placeholder for now, will be implemented with auth)
export async function getUserFavorites(userId: string): Promise<string[]> {
  console.log('getUserFavorites called, but not implemented yet. User ID:', userId);
  // This will be replaced with a real API call
  return []; 
}
