import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

// Updated for Vercel deployment with environment variables
interface AuthFormProps {
  mode: 'login' | 'register'
  onToggleMode: () => void
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode }) => {
  const { signIn, signUp, loading } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    console.log('🔐 AuthForm: Starting', mode, 'for', formData.email)

    // Validation
    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      return
    }

    if (mode === 'register' && !formData.username) {
      setError('Username is required for registration')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      if (mode === 'login') {
        console.log('🔐 AuthForm: Attempting login...')
        const { error } = await signIn(formData.email, formData.password)
        if (error) {
          console.error('🔐 AuthForm: Login failed:', error.message)
          
          // Special handling for test account
          if (formData.email === 'test@maxian.dev' && error.message === 'Invalid login credentials') {
            console.log('🧪 Test account not found, creating it first...')
            setError('Test account not found, creating it now...')
            
            // Try to create test account first
            const { error: signUpError } = await signUp(formData.email, formData.password, formData.username || 'MaxIanTest')
            
            if (signUpError && !signUpError.message.includes('already been registered')) {
              setError(`Failed to create test account: ${signUpError.message}`)
              return
            }
            
            // Wait a moment then try login again
            setTimeout(async () => {
              console.log('🧪 Retrying login after account creation...')
              const { error: retryError } = await signIn(formData.email, formData.password)
              if (retryError) {
                setError(`Still unable to login: ${retryError.message}`)
              } else {
                console.log('🧪 Test account login successful!')
              }
            }, 2000)
            
            return
          }
          
          setError(error.message || 'Login failed')
        } else {
          console.log('🔐 AuthForm: Login successful!')
        }
      } else {
        console.log('🔐 AuthForm: Attempting registration...')
        const { error } = await signUp(formData.email, formData.password, formData.username)
        if (error) {
          console.error('🔐 AuthForm: Registration failed:', error.message)
          setError(error.message || 'Registration failed')
        } else {
          console.log('🔐 AuthForm: Registration successful!')
          setSuccessMessage('Registration successful! You can now login.')
        }
      }
    } catch (err: any) {
      console.error('🔐 AuthForm: Unexpected error:', err)
      setError('An unexpected error occurred')
    }
  }

  const isLogin = mode === 'login'

  const fillTestCredentials = () => {
    setFormData({
      email: 'test@maxian.dev',
      password: 'testpass123',
      username: 'MaxIanTest'
    })
    setError('')
    setSuccessMessage('')
  }

  const createAndLoginTestAccount = async () => {
    setError('')
    setSuccessMessage('')

    try {
      console.log('🧪 Creating test account first...')
      
      // First try to create the account
      const { error: signUpError } = await signUp('test@maxian.dev', 'testpass123', 'MaxIanTest')
      
      if (signUpError && !signUpError.message.includes('already been registered')) {
        setError(`Failed to create test account: ${signUpError.message}`)
        return
      }

      // Wait a moment for account creation
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Then try to login
      console.log('🧪 Now logging in with test account...')
      const { error: signInError } = await signIn('test@maxian.dev', 'testpass123')
      
      if (signInError) {
        setError(`Login failed: ${signInError.message}`)
      } else {
        console.log('🧪 Test account login successful!')
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Test Credentials Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">🧪 Test Account (No Email Verification)</h3>
          <div className="bg-white rounded p-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div><strong>Email:</strong></div>
              <div className="font-mono text-xs">test@maxian.dev</div>
              <div><strong>Password:</strong></div>
              <div className="font-mono text-xs">testpass123</div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                type="button"
                onClick={fillTestCredentials}
                className="bg-blue-600 text-white py-2 px-3 rounded text-xs hover:bg-blue-700 transition-colors"
              >
                📝 Auto-fill Form
              </button>
              <button
                type="button"
                onClick={createAndLoginTestAccount}
                disabled={loading}
                className="bg-green-600 text-white py-2 px-3 rounded text-xs hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? '⏳ Working...' : '🚀 Create & Login'}
              </button>
            </div>
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <strong>📋 Instructions:</strong><br/>
              1. Click "📝 Auto-fill Form" to fill the fields<br/>
              2. Click "Sign in" (account will be auto-created if needed)<br/>
              3. Or click "🚀 Create & Login" for instant access
            </div>
          </div>
        </div>

        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={onToggleMode}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required={!isLogin}
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                  isLogin ? 'rounded-t-md' : ''
                } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md">
              {successMessage}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                isLogin ? 'Sign in' : 'Sign up'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 