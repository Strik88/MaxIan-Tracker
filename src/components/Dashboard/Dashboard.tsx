import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { HabitForm } from '../Habits/HabitForm'
import { HabitList } from '../Habits/HabitList'
import { WeeklyCalendar } from '../Calendar/WeeklyCalendar'
import { runDatabaseTests, checkEnvironmentVariables } from '../../utils/testDatabase'

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth()
  
  // Get current week's Monday
  const getCurrentWeekStart = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Make Monday = 0
    
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)
    
    return monday.toISOString().split('T')[0]
  }

  const [currentWeekStart, setCurrentWeekStart] = useState(getCurrentWeekStart())
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)

  const handleHabitCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleWeekChange = (newWeekStart: string) => {
    setCurrentWeekStart(newWeekStart)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const runTests = async () => {
    setIsRunningTests(true)
    setTestResults(null)
    
    console.log('🧪 Starting comprehensive database tests from Dashboard...')
    
    try {
      // First check environment variables
      const envCheck = checkEnvironmentVariables()
      
      if (!envCheck) {
        setTestResults({
          connection: false,
          schema: false,
          auth: false,
          taskCreation: false,
          summary: '❌ Environment variables not set properly'
        })
        return
      }

      // Run full database tests
      const results = await runDatabaseTests()
      setTestResults(results)
      
    } catch (error: any) {
      console.error('Test error:', error)
      setTestResults({
        connection: false,
        schema: false,
        auth: false,
        taskCreation: false,
        summary: `❌ Test failed: ${error.message}`
      })
    } finally {
      setIsRunningTests(false)
    }
  }

  // Dev bypass mode check
  const isDevBypass = !user
  const displayEmail = user?.user_metadata?.username || user?.email || 'Dev User (No Auth)'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MaxIan Task Tracker</h1>
              <p className="text-sm text-gray-600">
                {isDevBypass ? (
                  <span className="text-red-600">🔧 Development Mode (No Authentication)</span>
                ) : (
                  `Welcome back, ${displayEmail}`
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={runTests}
                disabled={isRunningTests}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isRunningTests ? '🧪 Testing...' : '🧪 Test Database'}
              </button>
              <button
                onClick={handleSignOut}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                {isDevBypass ? 'Exit Dev Mode' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Results */}
        {testResults && (
          <div className={`rounded-lg p-4 mb-6 ${testResults.summary.includes('ALL TESTS PASSED') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h3 className={`font-semibold ${testResults.summary.includes('ALL TESTS PASSED') ? 'text-green-900' : 'text-red-900'}`}>
              🧪 Database Test Results
            </h3>
            <div className="mt-2 space-y-1 text-sm">
              <div className={testResults.connection ? 'text-green-700' : 'text-red-700'}>
                Connection: {testResults.connection ? '✅ Pass' : '❌ Fail'}
              </div>
              <div className={testResults.schema ? 'text-green-700' : 'text-red-700'}>
                Schema: {testResults.schema ? '✅ Pass' : '❌ Fail'}
              </div>
              <div className={testResults.auth ? 'text-green-700' : 'text-red-700'}>
                Auth: {testResults.auth ? '✅ Pass' : '❌ Fail'}
              </div>
              <div className={testResults.taskCreation ? 'text-green-700' : 'text-red-700'}>
                Task Creation: {testResults.taskCreation ? '✅ Pass' : '❌ Fail'}
              </div>
            </div>
            <p className={`mt-2 font-medium ${testResults.summary.includes('ALL TESTS PASSED') ? 'text-green-800' : 'text-red-800'}`}>
              {testResults.summary}
            </p>
          </div>
        )}

        {isDevBypass && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-900 font-semibold">⚠️ Development Bypass Mode</h3>
            <p className="text-red-700 text-sm mt-1">
              You're testing without authentication. Task management may have limited functionality.
            </p>
          </div>
        )}
        
        <div className="space-y-6">
          {/* Weekly Calendar View */}
          <WeeklyCalendar 
            currentWeekStart={currentWeekStart}
            onWeekChange={handleWeekChange}
            refreshTrigger={refreshTrigger}
          />

          {/* Habit Management */}
          <HabitForm 
            onHabitCreated={handleHabitCreated}
          />

          <HabitList 
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    </div>
  )
} 