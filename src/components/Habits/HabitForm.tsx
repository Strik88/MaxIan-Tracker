import React, { useState } from 'react'
import { habitService } from '../../services/database'
import { useAuth } from '../../contexts/AuthContext'

interface HabitFormProps {
  onHabitCreated?: () => void
}

export const HabitForm: React.FC<HabitFormProps> = ({ onHabitCreated }) => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    kind: 'mainline' as 'hardline' | 'mainline',
    icon: '📝'
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to create habits')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error: createError } = await habitService.createHabit({
        user_id: user.id,
        name: formData.name,
        kind: formData.kind,
        icon: formData.icon,
        sort_order: 0
      })

      if (createError) throw createError

      // Reset form
      setFormData({ name: '', kind: 'mainline', icon: '📝' })
      setIsOpen(false)
      onHabitCreated?.()
      
    } catch (err: any) {
      setError(err.message || 'Failed to create habit')
    } finally {
      setIsLoading(false)
    }
  }

  const iconOptions = ['📝', '💪', '🏃', '📚', '🧘', '💧', '🥗', '😴', '🎯', '⚡']

  if (!isOpen) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
        >
          + Add New Habit
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Add New Habit</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Habit Type
          </label>
          <select
            value={formData.kind}
            onChange={(e) => setFormData(prev => ({ ...prev, kind: e.target.value as 'hardline' | 'mainline' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="hardline">Hardline (Critical Daily Habit)</option>
            <option value="mainline">Mainline (Important Regular Habit)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Icon
          </label>
          <div className="grid grid-cols-5 gap-2 mb-2">
            {iconOptions.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, icon }))}
                className={`p-2 text-2xl border rounded-md hover:bg-gray-50 ${
                  formData.icon === icon ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Habit Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter habit name..."
            required
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Habit'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}