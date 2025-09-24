import { supabase } from '../lib/supabase'
import type { User, Task, TaskCompletion, Habit, HabitLog } from '../lib/supabase'

// Auth functions
export const authService = {
  // Sign up new user (with email verification disabled for development)
  async signUp(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
        // Disable email confirmation for development testing
        emailRedirectTo: undefined,
      }
    })
    return { data, error }
  },

  // Sign in user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get current session
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },
}

// User profile functions
export const userService = {
  // Get user profile
  async getProfile(userId: string): Promise<{ data: User | null; error: any }> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    return { data, error }
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  },
}

// Habit functions (updated for new schema)
export const habitService = {
  // Get all habits for user
  async getHabits(userId: string): Promise<{ data: Habit[] | null; error: any }> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    
    return { data, error }
  },

  // Create new habit
  async createHabit(habit: Omit<Habit, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('habits')
      .insert([habit])
      .select()
      .single()
    
    return { data, error }
  },

  // Update habit
  async updateHabit(habitId: string, updates: Partial<Habit>) {
    const { data, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', habitId)
      .select()
      .single()
    
    return { data, error }
  },

  // Delete habit
  async deleteHabit(habitId: string) {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId)
    
    return { error }
  },
}

// Habit log functions (daily completion tracking)
export const habitLogService = {
  // Get habit logs for a date range
  async getHabitLogs(userId: string, startDate: string, endDate: string): Promise<{ data: HabitLog[] | null; error: any }> {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
    
    return { data, error }
  },

  // Toggle habit completion for a specific date
  async toggleHabitLog(userId: string, habitId: string, date: string, status: 'checked' | 'missed' | 'not_checked') {
    // First, try to update existing log
    const { data: existingLog, error: fetchError } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .eq('date', date)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // Error other than "not found"
      return { data: null, error: fetchError }
    }

    if (existingLog) {
      // Update existing log
      const { data, error } = await supabase
        .from('habit_logs')
        .update({ status })
        .eq('id', existingLog.id)
        .select()
        .single()
      
      return { data, error }
    } else {
      // Create new log
      const { data, error } = await supabase
        .from('habit_logs')
        .insert([{
          user_id: userId,
          habit_id: habitId,
          date,
          status,
        }])
        .select()
        .single()
      
      return { data, error }
    }
  },
}

// Task functions
export const taskService = {
  // Get tasks for a specific week
  async getTasksForWeek(userId: string, weekStartDate: string): Promise<{ data: Task[] | null; error: any }> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start_date', weekStartDate)
      .eq('is_active', true)
      .order('type', { ascending: true }) // H, M, S order
      .order('created_at', { ascending: true })
    
    return { data, error }
  },

  // Create new task
  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single()
    
    return { data, error }
  },

  // Update task
  async updateTask(taskId: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single()
    
    return { data, error }
  },

  // Delete task (soft delete by setting is_active to false)
  async deleteTask(taskId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ is_active: false })
      .eq('id', taskId)
      .select()
      .single()
    
    return { data, error }
  },

  // Get all active tasks for user (for streak calculations)
  async getAllActiveTasks(userId: string): Promise<{ data: Task[] | null; error: any }> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('type', { ascending: true })
      .order('created_at', { ascending: true })
    
    return { data, error }
  },
}

// Task completion functions
export const completionService = {
  // Get completions for a task
  async getTaskCompletions(taskId: string): Promise<{ data: TaskCompletion[] | null; error: any }> {
    const { data, error } = await supabase
      .from('task_completions')
      .select('*')
      .eq('task_id', taskId)
      .order('completion_date', { ascending: false })
    
    return { data, error }
  },

  // Get completions for a specific week
  async getWeekCompletions(taskIds: string[], weekStartDate: string): Promise<{ data: TaskCompletion[] | null; error: any }> {
    const weekStart = new Date(weekStartDate)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    
    const { data, error } = await supabase
      .from('task_completions')
      .select('*')
      .in('task_id', taskIds)
      .gte('completion_date', weekStart.toISOString().split('T')[0])
      .lte('completion_date', weekEnd.toISOString().split('T')[0])
    
    return { data, error }
  },

  // Toggle task completion for a specific date
  async toggleCompletion(taskId: string, completionDate: string, isCompleted: boolean) {
    // First, try to update existing completion
    const { data: existingCompletion, error: fetchError } = await supabase
      .from('task_completions')
      .select('*')
      .eq('task_id', taskId)
      .eq('completion_date', completionDate)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // Error other than "not found"
      return { data: null, error: fetchError }
    }

    if (existingCompletion) {
      // Update existing completion
      const { data, error } = await supabase
        .from('task_completions')
        .update({ is_completed: isCompleted })
        .eq('id', existingCompletion.id)
        .select()
        .single()
      
      return { data, error }
    } else {
      // Create new completion
      const { data, error } = await supabase
        .from('task_completions')
        .insert([{
          task_id: taskId,
          completion_date: completionDate,
          is_completed: isCompleted,
        }])
        .select()
        .single()
      
      return { data, error }
    }
  },

  // Get completion for specific task and date
  async getCompletion(taskId: string, completionDate: string): Promise<{ data: TaskCompletion | null; error: any }> {
    const { data, error } = await supabase
      .from('task_completions')
      .select('*')
      .eq('task_id', taskId)
      .eq('completion_date', completionDate)
      .single()
    
    return { data, error }
  },
}

// Utility functions
export const dbUtils = {
  // Test database connection
  async testConnection() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (error) {
        console.error('Database connection test failed:', error)
        return false
      }
      
      console.log('Database connection successful')
      return true
    } catch (err) {
      console.error('Database connection test error:', err)
      return false
    }
  },

  // Get database health status
  async getHealthStatus() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    return {
      isHealthy: !error,
      error: error?.message || null,
      timestamp: new Date().toISOString(),
    }
  },
} 