import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'

export function useAuth() {
  const router = useRouter()
  const supabase = createClient()
  const {
    user,
    profile,
    isLoading,
    isInitialized,
    setUser,
    setProfile,
    setLoading,
    setInitialized,
    signOut: storeSignOut,
    isAuthenticated,
    isPremium,
    isVerified,
  } = useAuthStore()
  
  const { addNotification } = useUIStore()

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      try {
        setLoading(true)
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          return
        }

        if (mounted) {
          setUser(session?.user ?? null)
          
          // Get user profile if authenticated
          if (session?.user) {
            await fetchUserProfile(session.user.id)
          }
          
          setInitialized(true)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    if (!isInitialized) {
      initializeAuth()
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user.id)
          addNotification({
            type: 'success',
            title: 'خوش آمدید!',
            message: 'با موفقیت وارد شدید.',
          })
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
          addNotification({
            type: 'info',
            title: 'خروج موفق',
            message: 'با موفقیت از حساب کاربری خود خارج شدید.',
          })
        } else if (event === 'TOKEN_REFRESHED') {
          // Optionally refresh user profile
          if (session?.user) {
            await fetchUserProfile(session.user.id)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [isInitialized])

  // Fetch user profile
  async function fetchUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  // Sign in with email and password
  async function signInWithPassword(email: string, password: string) {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        addNotification({
          type: 'error',
          title: 'خطا در ورود',
          message: error.message,
        })
        return { success: false, error }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error signing in:', error)
      addNotification({
        type: 'error',
        title: 'خطا در ورود',
        message: 'خطای غیرمنتظره‌ای رخ داد.',
      })
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  // Sign up with email and password
  async function signUp(email: string, password: string, fullName?: string) {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        addNotification({
          type: 'error',
          title: 'خطا در ثبت‌نام',
          message: error.message,
        })
        return { success: false, error }
      }

      if (data.user && !data.session) {
        addNotification({
          type: 'info',
          title: 'تأیید ایمیل',
          message: 'لطفاً ایمیل خود را بررسی کرده و لینک تأیید را کلیک کنید.',
        })
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error signing up:', error)
      addNotification({
        type: 'error',
        title: 'خطا در ثبت‌نام',
        message: 'خطای غیرمنتظره‌ای رخ داد.',
      })
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  // Sign in with OAuth provider
  async function signInWithOAuth(provider: 'google' | 'github') {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        addNotification({
          type: 'error',
          title: 'خطا در ورود',
          message: error.message,
        })
        return { success: false, error }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error signing in with OAuth:', error)
      addNotification({
        type: 'error',
        title: 'خطا در ورود',
        message: 'خطای غیرمنتظره‌ای رخ داد.',
      })
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  async function signOut() {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        addNotification({
          type: 'error',
          title: 'خطا در خروج',
          message: error.message,
        })
        return { success: false, error }
      }

      storeSignOut()
      router.push('/')
      
      return { success: true }
    } catch (error) {
      console.error('Error signing out:', error)
      addNotification({
        type: 'error',
        title: 'خطا در خروج',
        message: 'خطای غیرمنتظره‌ای رخ داد.',
      })
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  // Reset password
  async function resetPassword(email: string) {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        addNotification({
          type: 'error',
          title: 'خطا در بازیابی رمز عبور',
          message: error.message,
        })
        return { success: false, error }
      }

      addNotification({
        type: 'success',
        title: 'ایمیل ارسال شد',
        message: 'لینک بازیابی رمز عبور به ایمیل شما ارسال شد.',
      })

      return { success: true }
    } catch (error) {
      console.error('Error resetting password:', error)
      addNotification({
        type: 'error',
        title: 'خطا در بازیابی رمز عبور',
        message: 'خطای غیرمنتظره‌ای رخ داد.',
      })
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  // Update password
  async function updatePassword(password: string) {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        addNotification({
          type: 'error',
          title: 'خطا در تغییر رمز عبور',
          message: error.message,
        })
        return { success: false, error }
      }

      addNotification({
        type: 'success',
        title: 'رمز عبور تغییر کرد',
        message: 'رمز عبور شما با موفقیت تغییر کرد.',
      })

      return { success: true }
    } catch (error) {
      console.error('Error updating password:', error)
      addNotification({
        type: 'error',
        title: 'خطا در تغییر رمز عبور',
        message: 'خطای غیرمنتظره‌ای رخ داد.',
      })
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  // Update profile
  async function updateProfile(updates: Partial<typeof profile>) {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        addNotification({
          type: 'error',
          title: 'خطا در بروزرسانی پروفایل',
          message: error.message,
        })
        return { success: false, error }
      }

      setProfile(data)
      addNotification({
        type: 'success',
        title: 'پروفایل بروزرسانی شد',
        message: 'اطلاعات پروفایل شما با موفقیت بروزرسانی شد.',
      })

      return { success: true, data }
    } catch (error) {
      console.error('Error updating profile:', error)
      addNotification({
        type: 'error',
        title: 'خطا در بروزرسانی پروفایل',
        message: 'خطای غیرمنتظره‌ای رخ داد.',
      })
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  // Require authentication
  function requireAuth(redirectTo = '/auth/login') {
    if (!isAuthenticated()) {
      router.push(redirectTo)
      return false
    }
    return true
  }

  // Require premium
  function requirePremium(redirectTo = '/subscription') {
    if (!isPremium()) {
      router.push(redirectTo)
      return false
    }
    return true
  }

  return {
    // State
    user,
    profile,
    isLoading,
    isInitialized,
    
    // Computed
    isAuthenticated: isAuthenticated(),
    isPremium: isPremium(),
    isVerified: isVerified(),
    
    // Actions
    signInWithPassword,
    signUp,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    fetchUserProfile,
    requireAuth,
    requirePremium,
  }
}