import React from 'react'

export const EnvCheck: React.FC = () => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md">
      <h3 className="font-bold text-sm mb-2">🔍 Environment Check</h3>
      <div className="text-xs space-y-1">
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
      </div>
    </div>
  )
} 