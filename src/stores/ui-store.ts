import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system'
  
  // Layout
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  
  // Modals
  authModalOpen: boolean
  searchModalOpen: boolean
  filtersModalOpen: boolean
  
  // Loading states
  globalLoading: boolean
  
  // Notifications
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
    action?: {
      label: string
      onClick: () => void
    }
  }>
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setSidebarOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  setAuthModalOpen: (open: boolean) => void
  setSearchModalOpen: (open: boolean) => void
  setFiltersModalOpen: (open: boolean) => void
  setGlobalLoading: (loading: boolean) => void
  
  // Notification actions
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // Utility actions
  closeAllModals: () => void
  toggleSidebar: () => void
  toggleMobileMenu: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'dark',
      sidebarOpen: false,
      mobileMenuOpen: false,
      authModalOpen: false,
      searchModalOpen: false,
      filtersModalOpen: false,
      globalLoading: false,
      notifications: [],
      
      // Actions
      setTheme: (theme) => set({ theme }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
      setAuthModalOpen: (authModalOpen) => set({ authModalOpen }),
      setSearchModalOpen: (searchModalOpen) => set({ searchModalOpen }),
      setFiltersModalOpen: (filtersModalOpen) => set({ filtersModalOpen }),
      setGlobalLoading: (globalLoading) => set({ globalLoading }),
      
      // Notification actions
      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newNotification = { ...notification, id }
        
        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }))
        
        // Auto remove notification after duration
        if (notification.duration !== 0) {
          setTimeout(() => {
            get().removeNotification(id)
          }, notification.duration || 5000)
        }
      },
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      // Utility actions
      closeAllModals: () => set({
        authModalOpen: false,
        searchModalOpen: false,
        filtersModalOpen: false,
        mobileMenuOpen: false,
      }),
      
      toggleSidebar: () => set((state) => ({
        sidebarOpen: !state.sidebarOpen
      })),
      
      toggleMobileMenu: () => set((state) => ({
        mobileMenuOpen: !state.mobileMenuOpen
      })),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)