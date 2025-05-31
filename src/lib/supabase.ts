import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface User {
  id: string
  email: string
  username: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  type: 'H' | 'M' | 'S' // Hard Line, Main Line, Soft Line
  week_start_date: string // ISO date string for Monday of the week
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TaskCompletion {
  id: string
  task_id: string
  completion_date: string // ISO date string
  is_completed: boolean
  created_at: string
  updated_at: string
}

// Helper function to get current week's Monday
export const getCurrentWeekMonday = (): string => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  return monday.toISOString().split('T')[0]
}

// Helper function to calculate streak for a task
export const calculateStreak = (completions: TaskCompletion[]): number => {
  if (completions.length === 0) return 0
  
  // Sort completions by date (most recent first)
  const sortedCompletions = completions
    .filter(c => c.is_completed)
    .sort((a, b) => new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime())
  
  if (sortedCompletions.length === 0) return 0
  
  let streak = 0
  const today = new Date()
  let currentDate = new Date(today)
  
  // Start from today and work backwards
  for (let i = 0; i < sortedCompletions.length; i++) {
    const completionDate = new Date(sortedCompletions[i].completion_date)
    const currentDateStr = currentDate.toISOString().split('T')[0]
    const completionDateStr = completionDate.toISOString().split('T')[0]
    
    if (currentDateStr === completionDateStr) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }
  
  return streak
}

// Helper function to calculate completion percentage for current week
export const calculateWeeklyCompletionPercentage = (
  completions: TaskCompletion[],
  weekStartDate: string
): number => {
  const weekStart = new Date(weekStartDate)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  
  const weekCompletions = completions.filter(c => {
    const completionDate = new Date(c.completion_date)
    return completionDate >= weekStart && completionDate <= weekEnd
  })
  
  const completedDays = weekCompletions.filter(c => c.is_completed).length
  const totalDays = 7
  
  return Math.round((completedDays / totalDays) * 100)
} 