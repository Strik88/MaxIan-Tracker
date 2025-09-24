import React, { useState, useEffect, useCallback } from 'react'
import { habitService, habitLogService } from '../../services/database'
import { useAuth } from '../../contexts/AuthContext'
import type { Habit, HabitLog } from '../../lib/supabase'

interface WeeklyCalendarProps {
  currentWeekStart: string
  onWeekChange: (weekStart: string) => void
  refreshTrigger?: number
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ 
  currentWeekStart, 
  onWeekChange, 
  refreshTrigger 
}) => {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Get week dates
  const getWeekDates = (weekStart: string) => {
    const dates = []
    const start = new Date(weekStart)
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    
    return dates
  }

  const weekDates = getWeekDates(currentWeekStart)
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const loadData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      // Load habits
      const { data: habitsData } = await habitService.getHabits(user.id)
      setHabits(habitsData || [])

      // Load habit logs for the week
      const weekStart = weekDates[0]
      const weekEnd = weekDates[6]
      const { data: logsData } = await habitLogService.getHabitLogs(user.id, weekStart, weekEnd)
      setHabitLogs(logsData || [])

    } catch (err) {
      console.error('Failed to load calendar data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user, currentWeekStart])

  useEffect(() => {
    loadData()
  }, [loadData, refreshTrigger])

  const getHabitLogStatus = (habitId: string, date: string): 'checked' | 'missed' | 'not_checked' => {
    const log = habitLogs.find(log => log.habit_id === habitId && log.date === date)
    return log?.status || 'not_checked'
  }

  const toggleHabitLog = async (habitId: string, date: string) => {
    if (!user?.id) return

    const currentStatus = getHabitLogStatus(habitId, date)
    const newStatus = currentStatus === 'checked' ? 'not_checked' : 'checked'

    try {
      const { data } = await habitLogService.toggleHabitLog(user.id, habitId, date, newStatus)
      
      if (data) {
        // Update local state
        setHabitLogs(prev => {
          const existing = prev.find(log => log.habit_id === habitId && log.date === date)
          if (existing) {
            return prev.map(log => 
              log.id === existing.id ? { ...log, status: newStatus } : log
            )
          } else {
            return [...prev, data]
          }
        })
      }
    } catch (err) {
      console.error('Failed to toggle habit log:', err)
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const current = new Date(currentWeekStart)
    const days = direction === 'prev' ? -7 : 7
    current.setDate(current.getDate() + days)
    
    const newWeekStart = current.toISOString().split('T')[0]
    onWeekChange(newWeekStart)
  }

  const goToCurrentWeek = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)
    
    const weekStart = monday.toISOString().split('T')[0]
    onWeekChange(weekStart)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked': return 'bg-green-500 text-white'
      case 'missed': return 'bg-red-500 text-white'
      default: return 'bg-gray-200 text-gray-600 hover:bg-gray-300'
    }
  }

  const getKindColor = (kind: string) => {
    switch (kind) {
      case 'hardline': return 'border-l-red-500'
      case 'mainline': return 'border-l-blue-500'
      default: return 'border-l-gray-300'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Week Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => navigateWeek('prev')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
        >
          ← Previous
        </button>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            Week of {new Date(currentWeekStart).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <button
            onClick={goToCurrentWeek}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Go to Current Week
          </button>
        </div>
        
        <button
          onClick={() => navigateWeek('next')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
        >
          Next →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {habits.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📅</div>
            <p>No habits to track yet.</p>
            <p className="text-sm">Create some habits first!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2 font-medium text-gray-700 w-48">Habit</th>
                  {weekDates.map((date, index) => (
                    <th key={date} className="text-center p-2 font-medium text-gray-700 min-w-16">
                      <div>{dayNames[index]}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(date).getDate()}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {habits.map((habit) => (
                  <tr key={habit.id} className={`border-l-4 ${getKindColor(habit.kind)}`}>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{habit.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{habit.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{habit.kind}</div>
                        </div>
                      </div>
                    </td>
                    {weekDates.map((date) => {
                      const status = getHabitLogStatus(habit.id, date)
                      return (
                        <td key={date} className="p-2 text-center">
                          <button
                            onClick={() => toggleHabitLog(habit.id, date)}
                            className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${getStatusColor(status)}`}
                            title={`${habit.name} - ${date} - ${status}`}
                          >
                            {status === 'checked' ? '✓' : status === 'missed' ? '✗' : '○'}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}