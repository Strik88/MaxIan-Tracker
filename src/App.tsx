import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Task Tracker
          </h1>
          <p className="text-gray-600 mb-8">
            Track your daily tasks and build streaks
          </p>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Coming Soon
              </h2>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• H-tasks (Hard Line) - High Priority</li>
                <li>• M-tasks (Main Line) - Medium Priority</li>
                <li>• S-tasks (Soft Line) - Low Priority</li>
              </ul>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 mb-2">
                Features
              </h2>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Weekly calendar view</li>
                <li>• Streak tracking</li>
                <li>• Completion percentages</li>
                <li>• PWA support</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Get Started (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
