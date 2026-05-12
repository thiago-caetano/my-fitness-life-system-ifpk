'use client'

import { useState } from 'react'
import { startWorkoutSession } from '@/lib/actions/sessions'
import type { WorkoutPlan, WorkoutDay } from '@/lib/types'

interface WorkoutSelectorProps {
  plans: WorkoutPlan[]
  onSessionStarted: (session: unknown) => void
  onCancel: () => void
}

export function WorkoutSelector({ plans, onSessionStarted, onCancel }: WorkoutSelectorProps) {
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null)
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleStart() {
    setLoading(true)
    setError('')
    const result = await startWorkoutSession({
      workout_plan_id: selectedPlan?.id,
      workout_day_id: selectedDay?.id,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onSessionStarted(result.session)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-900">Selecionar treino</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1 transition">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Select plan */}
      <div className="flex flex-col gap-2 mb-4">
        <p className="text-sm font-medium text-gray-700">Plano de treino</p>
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => {
              setSelectedPlan(plan)
              setSelectedDay(null)
            }}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition text-sm ${
              selectedPlan?.id === plan.id
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <p className="font-semibold">{plan.name}</p>
            {plan.goal && <p className="text-xs text-gray-400 mt-0.5">{plan.goal}</p>}
          </button>
        ))}
      </div>

      {/* Select day */}
      {selectedPlan?.workout_days && selectedPlan.workout_days.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          <p className="text-sm font-medium text-gray-700">Dia de treino</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {selectedPlan.workout_days.map((day) => (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-3 rounded-xl border-2 transition text-sm text-left ${
                  selectedDay?.id === day.id
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold">{day.name}</p>
                {day.day_label && <p className="text-xs text-gray-400">{day.day_label}</p>}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handleStart}
        disabled={!selectedPlan || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition"
      >
        {loading ? 'Iniciando...' : 'Iniciar treino'}
      </button>
    </div>
  )
}
