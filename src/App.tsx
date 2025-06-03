// DEPLOYMENT TRIGGER: 2025-06-02-15:15:00 - FORCE TEST CREDENTIALS UPDATE
import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthForm } from './components/Auth/AuthForm'
import { Dashboard } from './components/Dashboard/Dashboard'
import { EnvCheck } from './components/Debug/EnvCheck'
import './App.css'

// Force deployment timestamp: 2025-01-31 20:15 - TEST CREDENTIALS VISIBLE
console.log('🚀 Task Tracker App Loading - Auth Version v2.2 - Test Credentials Integrated')
console.log('Environment variables:', {
  hasSupabaseUrl: !!process.env.REACT_APP_SUPABASE_URL,
  hasSupabaseKey: !!process.env.REACT_APP_SUPABASE_ANON_KEY,
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL?.substring(0, 20) + '...',
})

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [devBypass, setDevBypass] = useState(false)

  console.log('🎯 AppContent render:', { hasUser: !!user, userEmail: user?.email, loading, devBypass })

  const toggleAuthMode = () => {
    console.log('🔄 Toggling auth mode from', authMode, 'to', authMode === 'login' ? 'register' : 'login')
    setAuthMode(prev => prev === 'login' ? 'register' : 'login')
  }

  const enableDevBypass = () => {
    console.log('🔧 Development bypass enabled!')
    setDevBypass(true)
  }

  if (loading) {
    console.log('⏳ App is loading...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we check your session</p>
        </div>
        <EnvCheck />
      </div>
    )
  }

  if (user || devBypass) {
    console.log('✅ User authenticated or dev bypass, showing Dashboard')
    return (
      <>
        <Dashboard />
        <EnvCheck />
      </>
    )
  }

  console.log('🔐 No user found, showing AuthForm')
  return (
    <>
      <AuthForm mode={authMode} onToggleMode={toggleAuthMode} />
      
      {/* Development Bypass Button */}
      <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm z-50">
        <div className="text-sm">
          <h3 className="font-semibold text-red-900 mb-2">🔧 Dev Bypass</h3>
          <p className="text-xs text-red-700 mb-2">
            Rate limited by Supabase? Skip auth temporarily to test the app:
          </p>
          <button
            onClick={enableDevBypass}
            className="w-full bg-red-600 text-white px-3 py-2 rounded text-xs hover:bg-red-700"
          >
            🚀 Skip Auth & Test Dashboard
          </button>
        </div>
      </div>
      
      <EnvCheck />
    </>
  )
}

const App: React.FC = () => {
  console.log('🏁 App component mounting')
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
