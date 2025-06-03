import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { authService } from '../services/database'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: SupabaseUser | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔐 AuthProvider: Initializing authentication...')
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { session } = await authService.getCurrentSession()
        console.log('🔐 Initial session:', session?.user?.email || 'No session')
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error('🔐 Error getting initial session:', error)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email || 'No user')
        
        setSession(session)
        setUser(session?.user ?? null)
        
        // Don't set loading to false here if we're still in the initial load
        if (event !== 'INITIAL_SESSION') {
          setLoading(false)
        }
      }
    )

    return () => {
      console.log('🔐 Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, username: string) => {
    console.log('🔐 SignUp attempt for:', email)
    setLoading(true)
    
    try {
      const { error } = await authService.signUp(email, password, username)
      if (error) {
        console.error('🔐 Sign up error:', error.message)
      } else {
        console.log('🔐 Sign up successful! Check your email for verification.')
      }
      return { error }
    } catch (err) {
      console.error('🔐 Sign up exception:', err)
      return { error: err }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔐 SignIn attempt for:', email)
    setLoading(true)
    
    try {
      const { data, error } = await authService.signIn(email, password)
      
      if (error) {
        console.error('🔐 Sign in error:', error.message)
        setLoading(false)
        return { error }
      }

      if (data?.user) {
        console.log('🔐 Sign in successful for:', data.user.email)
        // Force update the session and user state
        setSession(data.session)
        setUser(data.user)
      }
      
      setLoading(false)
      return { error }
    } catch (err) {
      console.error('🔐 Sign in exception:', err)
      setLoading(false)
      return { error: err }
    }
  }

  const signOut = async () => {
    console.log('🔐 SignOut attempt')
    setLoading(true)
    
    try {
      const { error } = await authService.signOut()
      if (error) {
        console.error('🔐 Sign out error:', error.message)
      } else {
        console.log('🔐 Sign out successful!')
        // Clear state immediately
        setSession(null)
        setUser(null)
      }
      return { error }
    } catch (err) {
      console.error('🔐 Sign out exception:', err)
      return { error: err }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }

  // Debug logging
  console.log('🔐 AuthProvider state:', {
    hasUser: !!user,
    userEmail: user?.email,
    loading,
    hasSession: !!session
  })

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 