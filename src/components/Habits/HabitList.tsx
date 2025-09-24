import React, { useState, useEffect, useCallback } from 'react'
import { habitService } from '../../services/database'
import { useAuth } from '../../contexts/AuthContext'
import type { Habit } from '../../lib/supabase'

interface HabitListProps {
  refreshTrigger?: number
}

export const HabitList: React.FC<HabitListProps> = ({ refreshTrigger }) => {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadHabits = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await habitService.getHabits(user.id)
      
      if (fetchError) throw fetchError
      
      setHabits(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load habits')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadHabits()
  }, [loadHabits, refreshTrigger])

  const getKindColor = (kind: string) => {
    switch (kind) {
      case 'hardline': return 'bg-red-100 text-red-800 border-red-200'
      case 'mainline': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const deleteHabit = async (habitId: string) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return

    try {
      const { error: deleteError } = await habitService.deleteHabit(habitId)
      if (deleteError) throw deleteError
      
      // Remove habit from local state
      setHabits(prev => prev.filter(habit => habit.id !== habitId))
    } catch (err: any) {
      setError(err.message || 'Failed to delete habit')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-4xl mb-2">🎯</div>
        <p className="text-gray-600">No habits created yet.</p>
        <p className="text-sm text-gray-500">Add your first habit above to start tracking!</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Your Habits ({habits.length})
      </h3>
      
      <div className="space-y-3">
        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{habit.icon}</span>
              <div>
                <h4 className="font-medium text-gray-900">{habit.name}</h4>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getKindColor(habit.kind)}`}>
                  {habit.kind}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => deleteHabit(habit.id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}