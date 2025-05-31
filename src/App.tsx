import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthForm } from './components/Auth/AuthForm'
import { Dashboard } from './components/Dashboard/Dashboard'
import { EnvCheck } from './components/Debug/EnvCheck'
import './App.css'

// Force deployment timestamp: 2025-01-31 20:05
console.log('🚀 Task Tracker App Loading - Auth Version v2.0')
console.log('Environment variables:', {
  hasSupabaseUrl: !!process.env.REACT_APP_SUPABASE_URL,
  hasSupabaseKey: !!process.env.REACT_APP_SUPABASE_ANON_KEY
})

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'login' ? 'register' : 'login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
        <EnvCheck />
      </div>
    )
  }

  if (user) {
    return (
      <>
        <Dashboard />
        <EnvCheck />
      </>
    )
  }

  return (
    <>
      <AuthForm mode={authMode} onToggleMode={toggleAuthMode} />
      <EnvCheck />
    </>
  )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
