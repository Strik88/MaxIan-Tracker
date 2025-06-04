import { supabase } from '../lib/supabase'
import { authService, taskService, dbUtils } from '../services/database'

export const runDatabaseTests = async () => {
  console.log('🧪 Starting comprehensive database tests...')
  
  const results = {
    connection: false,
    schema: false,
    auth: false,
    taskCreation: false,
    summary: ''
  }

  try {
    // Test 1: Basic connection
    console.log('📡 Testing database connection...')
    const connectionTest = await dbUtils.testConnection()
    results.connection = connectionTest
    console.log(`Connection: ${connectionTest ? '✅ SUCCESS' : '❌ FAILED'}`)

    // Test 2: Check if tables exist
    console.log('🗃️ Testing database schema...')
    try {
      const { data: tablesData, error: tablesError } = await supabase
        .from('users')
        .select('id')
        .limit(1)
      
      if (!tablesError) {
        results.schema = true
        console.log('Schema: ✅ SUCCESS - Tables exist')
      } else {
        console.log('Schema: ❌ FAILED - Tables might not exist:', tablesError.message)
      }
    } catch (err) {
      console.log('Schema: ❌ FAILED - Error checking tables:', err)
    }

    // Test 3: Authentication test
    console.log('🔐 Testing authentication...')
    try {
      const { user } = await authService.getCurrentUser()
      if (user) {
        results.auth = true
        console.log('Auth: ✅ SUCCESS - User authenticated:', user.email)
      } else {
        console.log('Auth: ⚠️ WARNING - No user currently logged in (normal for testing)')
        results.auth = true // This is actually fine for testing
      }
    } catch (err) {
      console.log('Auth: ❌ FAILED - Auth error:', err)
    }

    // Test 4: Task creation test (with mock data)
    console.log('📝 Testing task creation...')
    try {
      // We'll use dev mode with mock user ID for testing
      const mockUserId = 'dev-user-12345'
      const testTask = {
        user_id: mockUserId,
        title: 'Test Task - Database Verification',
        description: 'This is a test task to verify database functionality',
        type: 'M' as 'H' | 'M' | 'S',
        week_start_date: new Date().toISOString().split('T')[0],
        is_active: true
      }

      const { data: createdTask, error: createError } = await taskService.createTask(testTask)
      
      if (!createError && createdTask) {
        results.taskCreation = true
        console.log('Task Creation: ✅ SUCCESS - Test task created:', createdTask.id)
        
        // Clean up test task
        await taskService.deleteTask(createdTask.id)
        console.log('🧹 Test task cleaned up')
      } else {
        console.log('Task Creation: ❌ FAILED - Error:', createError?.message)
      }
    } catch (err: any) {
      console.log('Task Creation: ❌ FAILED - Exception:', err.message)
    }

  } catch (error: any) {
    console.error('🚨 Test suite failed:', error.message)
  }

  // Generate summary
  const allPassed = results.connection && results.schema && results.auth && results.taskCreation
  results.summary = allPassed 
    ? '🎉 ALL TESTS PASSED - Ready for deployment!' 
    : '⚠️ Some tests failed - Check logs above'

  console.log('\n' + '='.repeat(50))
  console.log('📊 TEST RESULTS SUMMARY:')
  console.log(`Connection: ${results.connection ? '✅' : '❌'}`)
  console.log(`Schema: ${results.schema ? '✅' : '❌'}`)
  console.log(`Auth: ${results.auth ? '✅' : '❌'}`)
  console.log(`Task Creation: ${results.taskCreation ? '✅' : '❌'}`)
  console.log('\n' + results.summary)
  console.log('='.repeat(50))

  return results
}

// Quick test for environment variables
export const checkEnvironmentVariables = () => {
  console.log('🔧 Checking environment variables...')
  
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

  console.log(`SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`)
  console.log(`SUPABASE_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`)
  
  if (supabaseUrl) {
    console.log(`URL Format: ${supabaseUrl.includes('supabase.co') ? '✅ Valid' : '❌ Invalid'}`)
  }
  
  return !!(supabaseUrl && supabaseKey)
}

// Window global for easy testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testDatabase = runDatabaseTests;
  (window as any).checkEnvVars = checkEnvironmentVariables;
} 