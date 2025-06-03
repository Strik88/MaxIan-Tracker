import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export const TestUser: React.FC = () => {
  const { signUp, signIn } = useAuth()
  const [isCreatingTest, setIsCreatingTest] = useState(false)
  const [message, setMessage] = useState('')

  // Test credentials
  const testCredentials = {
    email: 'test@maxian.dev',
    password: 'testpass123',
    username: 'MaxIanTest'
  }

  const createTestAccount = async () => {
    setIsCreatingTest(true)
    setMessage('')

    try {
      console.log('🧪 Creating test account...')
      const { error } = await signUp(
        testCredentials.email,
        testCredentials.password,
        testCredentials.username
      )

      if (error) {
        if (error.message.includes('already been registered')) {
          setMessage('✅ Test account already exists! You can log in directly.')
        } else {
          setMessage(`❌ Error: ${error.message}`)
        }
      } else {
        setMessage('✅ Test account created successfully!')
      }
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`)
    } finally {
      setIsCreatingTest(false)
    }
  }

  const loginWithTest = async () => {
    setIsCreatingTest(true)
    setMessage('')

    try {
      console.log('🧪 Logging in with test account...')
      const { error } = await signIn(testCredentials.email, testCredentials.password)

      if (error) {
        setMessage(`❌ Login failed: ${error.message}`)
      } else {
        setMessage('✅ Logged in successfully!')
      }
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`)
    } finally {
      setIsCreatingTest(false)
    }
  }

  return (
    <div className="fixed top-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <div className="text-sm">
        <h3 className="font-semibold text-blue-900 mb-2">🧪 Test Account</h3>
        
        <div className="bg-white rounded p-2 mb-3 text-xs font-mono">
          <div><strong>Email:</strong> {testCredentials.email}</div>
          <div><strong>Password:</strong> {testCredentials.password}</div>
          <div><strong>Username:</strong> {testCredentials.username}</div>
        </div>

        <div className="space-y-2 mb-3">
          <button
            onClick={createTestAccount}
            disabled={isCreatingTest}
            className="w-full bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
          >
            {isCreatingTest ? 'Creating...' : 'Create Test Account'}
          </button>
          
          <button
            onClick={loginWithTest}
            disabled={isCreatingTest}
            className="w-full bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
          >
            {isCreatingTest ? 'Logging in...' : 'Login with Test Account'}
          </button>
        </div>

        {message && (
          <div className={`text-xs p-2 rounded ${
            message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <div className="text-xs text-gray-500 mt-2">
          💡 Use this for testing without email verification
        </div>
      </div>
    </div>
  )
} 