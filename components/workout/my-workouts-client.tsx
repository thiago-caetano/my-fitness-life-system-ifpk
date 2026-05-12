'use client'

import { useState } from 'react'
import type { WorkoutPlan } from '@/lib/types'

interface MyWorkoutsClientProps {
  plans: WorkoutPlan[]
}

export function MyWorkoutsClient({ plans }: MyWorkoutsClientProps) {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(plans[0]?.id ?? null)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  if (plans.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
            <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">Nenhum plano atribuído</p>
        <p className="text-gray-400 text-sm mt-1">Aguarde seu personal trainer criar um plano para você.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {plans.map((plan) => (
        <div key={plan.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Plan header */}
          <button
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition text-left"
            onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
          >
            <div>
              <p className="font-semibold text-gray-900">{plan.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {plan.goal && `${plan.goal} · `}
                {plan.days_per_week}x/semana · {(plan.workout_days ?? []).length} dias de treino
              </p>
              {plan.description && (
                <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
              )}
            </div>
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform flex-shrink-0 ml-4 ${expandedPlan === plan.id ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Days */}
          {expandedPlan === plan.id && (
            <div className="px-6 pb-6 border-t border-gray-50">
              {(plan.workout_days ?? []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Nenhum dia cadastrado ainda.</p>
              ) : (
                <div className="flex flex-col gap-3 mt-4">
                  {(plan.workout_days ?? []).map((day) => (
                    <div key={day.id} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-left"
                        onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{day.name}</p>
                          {day.day_label && <p className="text-xs text-gray-400">{day.day_label}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{(day.exercises ?? []).length} exercícios</span>
                          <svg
                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className={`transition-transform ${expandedDay === day.id ? 'rotate-180' : ''}`}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                      </button>

                      {expandedDay === day.id && (
                        <div className="px-4 pb-4 border-t border-gray-50">
                          {(day.exercises ?? []).length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">Nenhum exercício cadastrado.</p>
                          ) : (
                            <div className="flex flex-col divide-y divide-gray-50">
                              {(day.exercises ?? []).map((ex, i) => (
                                <div key={ex.id} className="py-3 flex items-start gap-3">
                                  <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {i + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900">{ex.name}</p>
                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                          <rect x="1" y="12" width="22" height="2" /><rect x="6" y="9" width="4" height="8" rx="1" /><rect x="14" y="9" width="4" height="8" rx="1" />
                                        </svg>
                                        {ex.sets} séries × {ex.reps} reps
                                      </span>
                                      {ex.weight_kg && (
                                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                                          {ex.weight_kg} kg
                                        </span>
                                      )}
                                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        {ex.rest_seconds}s descanso
                                      </span>
                                    </div>
                                    {ex.notes && (
                                      <p className="text-xs text-gray-400 italic mt-1.5">{ex.notes}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
