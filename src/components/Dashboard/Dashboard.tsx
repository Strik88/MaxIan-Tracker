import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task Tracker</h1>
              <p className="text-gray-600">Welcome back, {user?.user_metadata?.username || user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                🎉 Authentication Working!
              </h2>
              <p className="text-gray-600 mb-6">
                Great job setting up Supabase! Your authentication system is now working.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Successfully connected to Supabase!
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>✅ User authentication is working</p>
                      <p>✅ Database connection established</p>
                      <p>✅ Ready for task management features</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-left bg-gray-50 rounded-md p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">User Information:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li><strong>Email:</strong> {user?.email}</li>
                  <li><strong>User ID:</strong> {user?.id}</li>
                  <li><strong>Username:</strong> {user?.user_metadata?.username || 'Not set'}</li>
                  <li><strong>Email Confirmed:</strong> {user?.email_confirmed_at ? '✅ Yes' : '❌ No'}</li>
                  <li><strong>Account Created:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</li>
                </ul>
              </div>

              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  Next up: Building the task management interface!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 