import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '../types/database'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // console.log('AuthContext: Getting initial session...')
        const { data: { session } } = await supabase.auth.getSession()
        // console.log('AuthContext: Session:', session?.user?.id)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // console.log('AuthContext: Loading user profile...')
          await loadUserProfile(session.user.id)
        }
        
        // console.log('AuthContext: Setting loading to false')
        setLoading(false)
      } catch (error) {
        console.error('AuthContext: Error in getInitialSession:', error)
        setLoading(false)
      }
    }

    // Add a timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      // console.log('AuthContext: Timeout reached, forcing loading to false')
      setLoading(false)
    }, 10000) // 10 second timeout

    getInitialSession().finally(() => {
      clearTimeout(timeoutId)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // console.log('AuthContext: Auth state changed:', event, session?.user?.id)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // console.log('AuthContext: Loading profile for auth change...')
          await loadUserProfile(session.user.id)
        } else {
          // console.log('AuthContext: No session, clearing profile')
          setProfile(null)
        }
        
        // console.log('AuthContext: Auth state change complete, setting loading to false')
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      // console.log('AuthContext: Loading profile for user:', userId)
      
      // Add a timeout for the profile loading
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile loading timeout')), 5000)
      )
      
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any

      if (error) {
        console.error('AuthContext: Error loading user profile:', error)
        // console.log('AuthContext: Profile does not exist, trying to create it...')
        
        // Try to create the missing profile
        try {
          const { data: createResult, error: createError } = await supabase.rpc('create_missing_user_profile', {
            user_id: userId
          } as any)
          
          if (createError || !(createResult as any)?.success) {
            console.error('AuthContext: Failed to create profile:', createError || (createResult as any)?.error)
            setProfile(null)
            return
          }
          
          // console.log('AuthContext: Profile created successfully:', (createResult as any).profile)
          setProfile((createResult as any).profile)
        } catch (createErr) {
          console.error('AuthContext: Error creating profile:', createErr)
          setProfile(null)
        }
        return
      }

      // console.log('AuthContext: Profile loaded:', data)
      setProfile(data)
    } catch (error) {
      console.error('AuthContext: Error loading user profile:', error)
      // console.log('AuthContext: Setting profile to null due to error')
      setProfile(null)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const value = {
    user,
    profile,
    loading,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
