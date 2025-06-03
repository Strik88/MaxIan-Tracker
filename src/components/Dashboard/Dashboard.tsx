import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { TaskForm } from '../Tasks/TaskForm'
import { TaskList } from '../Tasks/TaskList'
import { WeekSelector } from '../Tasks/WeekSelector'

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

  const handleTaskCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleWeekChange = (newWeekStart: string) => {
    setCurrentWeekStart(newWeekStart)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MaxIan Task Tracker</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.user_metadata?.username || user?.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Week Navigation */}
          <WeekSelector 
            currentWeekStart={currentWeekStart}
            onWeekChange={handleWeekChange}
          />

          {/* Task Form */}
          <TaskForm 
            weekStartDate={currentWeekStart}
            onTaskCreated={handleTaskCreated}
          />

          {/* Task List */}
          <TaskList 
            weekStartDate={currentWeekStart}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    </div>
  )
} 