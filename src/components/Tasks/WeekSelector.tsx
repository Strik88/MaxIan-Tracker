import React from 'react'

interface WeekSelectorProps {
  currentWeekStart: string
  onWeekChange: (weekStart: string) => void
}

export const WeekSelector: React.FC<WeekSelectorProps> = ({ currentWeekStart, onWeekChange }) => {
  const getWeekDates = (weekStart: string) => {
    const start = new Date(weekStart)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    
    return {
      start: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      year: start.getFullYear()
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const current = new Date(currentWeekStart)
    const days = direction === 'prev' ? -7 : 7
    current.setDate(current.getDate() + days)
    
    // Format as YYYY-MM-DD
    const newWeekStart = current.toISOString().split('T')[0]
    onWeekChange(newWeekStart)
  }

  const goToCurrentWeek = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Make Monday = 0
    
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)
    
    const weekStart = monday.toISOString().split('T')[0]
    onWeekChange(weekStart)
  }

  const weekDates = getWeekDates(currentWeekStart)
  const currentWeek = getWeekDates(new Date().toISOString().split('T')[0])
  const isCurrentWeek = currentWeekStart === currentWeek.start

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateWeek('prev')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          title="Previous week"
        >
          ← 
        </button>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {weekDates.start} - {weekDates.end}, {weekDates.year}
          </div>
          <div className="text-sm text-gray-500">
            Week of Monday {weekDates.start}
          </div>
        </div>
        
        <button
          onClick={() => navigateWeek('next')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          title="Next week"
        >
          →
        </button>
      </div>
      
      {!isCurrentWeek && (
        <div className="mt-3 text-center">
          <button
            onClick={goToCurrentWeek}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Go to Current Week
          </button>
        </div>
      )}
    </div>
  )
} 