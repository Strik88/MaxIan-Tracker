import React, { useState, useEffect, useCallback } from 'react'
import { taskService } from '../../services/database'
import { useAuth } from '../../contexts/AuthContext'
import type { Task } from '../../lib/supabase'

interface TaskListProps {
  weekStartDate: string
  refreshTrigger?: number
}

export const TaskList: React.FC<TaskListProps> = ({ weekStartDate, refreshTrigger }) => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    // In dev bypass mode, use mock user ID
    const userId = user?.id || 'dev-user-12345'
    
    if (!userId) {
      console.log('🔧 No user ID available, skipping task load')
      setIsLoading(false)
      return
    }

    console.log('🔧 Loading tasks for user:', userId, user ? '(real user)' : '(dev bypass)')

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await taskService.getTasksForWeek(userId, weekStartDate)
      
      if (fetchError) throw fetchError
      
      setTasks(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }, [user, weekStartDate])

  useEffect(() => {
    loadTasks()
  }, [loadTasks, refreshTrigger])

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'H': return 'bg-red-100 text-red-800'
      case 'M': return 'bg-yellow-100 text-yellow-800'
      case 'S': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypePriority = (type: string) => {
    switch (type) {
      case 'H': return 1
      case 'M': return 2
      case 'S': return 3
      default: return 4
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityDiff = getTypePriority(a.type) - getTypePriority(b.type)
    if (priorityDiff !== 0) return priorityDiff
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  const deleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return

    try {
      const { error: deleteError } = await taskService.deleteTask(taskId)
      if (deleteError) throw deleteError
      
      // Remove task from local state
      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (err: any) {
      setError(err.message || 'Failed to delete task')
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

  if (sortedTasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📝</div>
        <p>No tasks for this week yet.</p>
        <p className="text-sm">Add your first task above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Tasks for Week ({tasks.length})
      </h3>
      
      {sortedTasks.map((task) => (
        <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(task.type)}`}>
                  {task.type}
                </span>
                <h4 className="text-lg font-medium text-gray-900 truncate">
                  {task.title}
                </h4>
              </div>
              
              {task.description && (
                <p className="text-gray-600 text-sm mb-2">
                  {task.description}
                </p>
              )}
              
              <div className="text-xs text-gray-400">
                Created: {new Date(task.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => deleteTask(task.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 