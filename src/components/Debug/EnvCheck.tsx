import React from 'react'

export const EnvCheck: React.FC = () => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY
  const nodeEnv = process.env.NODE_ENV

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">🔍 Environment Check</h3>
      <div className="text-xs space-y-1">
        <div>
          <span className="font-medium">Environment:</span>
          <span className="text-blue-600 ml-1">{nodeEnv || 'development'}</span>
        </div>
        <div>
          <span className="font-medium">Supabase URL:</span>
          <span className={supabaseUrl ? 'text-green-600' : 'text-red-600'}>
            {supabaseUrl ? ' ✅ Loaded' : ' ❌ Missing'}
          </span>
        </div>
        <div>
          <span className="font-medium">Supabase Key:</span>
          <span className={supabaseKey ? 'text-green-600' : 'text-red-600'}>
            {supabaseKey ? ' ✅ Loaded' : ' ❌ Missing'}
          </span>
        </div>
        {supabaseUrl && (
          <div className="text-gray-500 text-xs mt-2">
            URL: {supabaseUrl.substring(0, 30)}...
          </div>
        )}
        {(!supabaseUrl || !supabaseKey) && (
          <div className="text-red-600 text-xs mt-2 p-2 bg-red-50 rounded">
            <strong>⚠️ Missing env vars!</strong><br/>
            1. Stop the dev server (Ctrl+C)<br/>
            2. Check your .env.local file<br/>
            3. Restart with: npm start
          </div>
        )}
      </div>
    </div>
  )
} 