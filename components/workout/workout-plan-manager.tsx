'use client'

import { useState } from 'react'
import type { Profile, WorkoutPlan, WorkoutDay, Exercise } from '@/lib/types'
import {
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  createWorkoutDay,
  deleteWorkoutDay,
  createExercise,
  updateExercise,
  deleteExercise,
} from '@/lib/actions/workouts'

interface WorkoutPlanManagerProps {
  student: Profile
  personalId: string
  initialPlans: WorkoutPlan[]
  onPlansChange: (plans: WorkoutPlan[]) => void
}

export function WorkoutPlanManager({ student, personalId, initialPlans, onPlansChange }: WorkoutPlanManagerProps) {
  const [plans, setPlans] = useState<WorkoutPlan[]>(initialPlans)
  const [showNewPlan, setShowNewPlan] = useState(false)
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateState = (updated: WorkoutPlan[]) => {
    setPlans(updated)
    onPlansChange(updated)
  }

  // ---- Plan CRUD ----
  async function handleCreatePlan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    const result = await createWorkoutPlan({
      student_id: student.id,
      name: form.get('name') as string,
      description: form.get('description') as string,
      goal: form.get('goal') as string,
      days_per_week: Number(form.get('days_per_week') ?? 3),
    })
    if (result.error) {
      setError(result.error)
    } else if (result.plan) {
      const newPlan = { ...result.plan, workout_days: [] }
      updateState([newPlan, ...plans])
      setShowNewPlan(false)
      setExpandedPlan(result.plan.id)
    }
    setLoading(false)
  }

  async function handleDeletePlan(planId: string) {
    if (!confirm('Excluir este plano de treino?')) return
    await deleteWorkoutPlan(planId)
    updateState(plans.filter(p => p.id !== planId))
  }

  // ---- Day CRUD ----
  async function handleAddDay(planId: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const result = await createWorkoutDay({
      plan_id: planId,
      name: form.get('name') as string,
      day_label: form.get('day_label') as string,
      order_index: plans.find(p => p.id === planId)?.workout_days?.length ?? 0,
    })
    if (result.error) { setError(result.error); return }
    if (result.day) {
      const newDay = { ...result.day, exercises: [] }
      updateState(plans.map(p => p.id === planId
        ? { ...p, workout_days: [...(p.workout_days ?? []), newDay] }
        : p))
      ;(e.target as HTMLFormElement).reset()
    }
  }

  async function handleDeleteDay(planId: string, dayId: string) {
    if (!confirm('Excluir este dia de treino?')) return
    await deleteWorkoutDay(dayId)
    updateState(plans.map(p => p.id === planId
      ? { ...p, workout_days: (p.workout_days ?? []).filter(d => d.id !== dayId) }
      : p))
  }

  // ---- Exercise CRUD ----
  async function handleAddExercise(dayId: string, planId: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const day = plans.find(p => p.id === planId)?.workout_days?.find(d => d.id === dayId)
    const result = await createExercise({
      workout_day_id: dayId,
      name: form.get('name') as string,
      sets: Number(form.get('sets') ?? 3),
      reps: form.get('reps') as string,
      weight_kg: form.get('weight_kg') ? Number(form.get('weight_kg')) : undefined,
      rest_seconds: Number(form.get('rest_seconds') ?? 60),
      notes: form.get('notes') as string || undefined,
      order_index: day?.exercises?.length ?? 0,
    })
    if (result.error) { setError(result.error); return }
    if (result.exercise) {
      updateState(plans.map(p => p.id === planId ? {
        ...p,
        workout_days: (p.workout_days ?? []).map(d => d.id === dayId
          ? { ...d, exercises: [...(d.exercises ?? []), result.exercise!] }
          : d)
      } : p))
      ;(e.target as HTMLFormElement).reset()
    }
  }

  async function handleDeleteExercise(planId: string, dayId: string, exerciseId: string) {
    await deleteExercise(exerciseId)
    updateState(plans.map(p => p.id === planId ? {
      ...p,
      workout_days: (p.workout_days ?? []).map(d => d.id === dayId
        ? { ...d, exercises: (d.exercises ?? []).filter(ex => ex.id !== exerciseId) }
        : d)
    } : p))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Create plan */}
      {showNewPlan ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Novo plano de treino</h3>
          <form onSubmit={handleCreatePlan} className="flex flex-col gap-3">
            <input name="name" required placeholder="Nome do plano (ex: Hipertrofia A/B/C)" className="input-field" />
            <input name="goal" placeholder="Objetivo (ex: Ganho de massa)" className="input-field" />
            <textarea name="description" placeholder="Descrição (opcional)" rows={2} className="input-field resize-none" />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Dias por semana</label>
              <input name="days_per_week" type="number" min={1} max={7} defaultValue={3} className="input-field w-24" />
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</div>}
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50 transition">
                {loading ? 'Criando...' : 'Criar plano'}
              </button>
              <button type="button" onClick={() => setShowNewPlan(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button onClick={() => setShowNewPlan(true)} className="flex items-center gap-2 self-start bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Criar plano
        </button>
      )}

      {/* Plans list */}
      {plans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm">Nenhum plano de treino criado ainda.</p>
        </div>
      ) : (
        plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Plan header */}
            <div
              className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
            >
              <div>
                <p className="font-semibold text-gray-900">{plan.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {plan.goal ? `${plan.goal} · ` : ''}{plan.days_per_week}x/semana · {(plan.workout_days ?? []).length} dias
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id) }}
                  className="p-1.5 text-gray-300 hover:text-red-400 transition rounded-lg hover:bg-red-50"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                  </svg>
                </button>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={`transition-transform ${expandedPlan === plan.id ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Plan body */}
            {expandedPlan === plan.id && (
              <div className="px-6 pb-6 border-t border-gray-50">
                {/* Add day form */}
                <div className="mt-4 mb-4 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-700 mb-3">Adicionar dia de treino</p>
                  <form onSubmit={(e) => handleAddDay(plan.id, e)} className="flex flex-wrap gap-2">
                    <input name="name" required placeholder="Nome (ex: Treino A)" className="input-field flex-1 min-w-32 text-sm" />
                    <input name="day_label" placeholder="Dias (ex: Seg/Qua)" className="input-field flex-1 min-w-28 text-sm" />
                    <button type="submit" className="bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-800 transition whitespace-nowrap">
                      + Adicionar dia
                    </button>
                  </form>
                </div>

                {/* Days */}
                {(plan.workout_days ?? []).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhum dia cadastrado.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {(plan.workout_days ?? []).map((day) => (
                      <div key={day.id} className="border border-gray-100 rounded-xl overflow-hidden">
                        <div
                          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition"
                          onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{day.name}</p>
                            {day.day_label && <p className="text-xs text-gray-400">{day.day_label}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{(day.exercises ?? []).length} exercícios</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteDay(plan.id, day.id) }}
                              className="p-1 text-gray-300 hover:text-red-400 transition rounded"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {expandedDay === day.id && (
                          <div className="px-4 pb-4 border-t border-gray-50">
                            {/* Exercises */}
                            {(day.exercises ?? []).map((ex) => (
                              <div key={ex.id} className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                                  <p className="text-xs text-gray-400">
                                    {ex.sets} séries × {ex.reps} reps
                                    {ex.weight_kg ? ` · ${ex.weight_kg}kg` : ''}
                                    {` · ${ex.rest_seconds}s descanso`}
                                  </p>
                                  {ex.notes && <p className="text-xs text-gray-400 italic mt-0.5">{ex.notes}</p>}
                                </div>
                                <button
                                  onClick={() => handleDeleteExercise(plan.id, day.id, ex.id)}
                                  className="p-1 text-gray-300 hover:text-red-400 transition rounded ml-2"
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                              </div>
                            ))}

                            {/* Add exercise form */}
                            <div className="mt-3 pt-3 border-t border-gray-50">
                              <p className="text-xs font-medium text-gray-500 mb-2">Adicionar exercício</p>
                              <form onSubmit={(e) => handleAddExercise(day.id, plan.id, e)} className="flex flex-col gap-2">
                                <input name="name" required placeholder="Nome do exercício" className="input-field text-sm" />
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400">Séries</label>
                                    <input name="sets" type="number" defaultValue={3} min={1} className="input-field text-sm" />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400">Repetições</label>
                                    <input name="reps" defaultValue="12" placeholder="12 ou 8-12" className="input-field text-sm" />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400">Carga (kg)</label>
                                    <input name="weight_kg" type="number" step="0.5" placeholder="0" className="input-field text-sm" />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400">Descanso (s)</label>
                                    <input name="rest_seconds" type="number" defaultValue={60} min={0} className="input-field text-sm" />
                                  </div>
                                </div>
                                <input name="notes" placeholder="Observações (opcional)" className="input-field text-sm" />
                                <button type="submit" className="self-start bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition">
                                  + Adicionar exercício
                                </button>
                              </form>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}

      <style>{`
        .input-field {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          color: #111827;
          outline: none;
          transition: box-shadow 0.15s, border-color 0.15s;
        }
        .input-field::placeholder { color: #9ca3af; }
        .input-field:focus {
          border-color: transparent;
          box-shadow: 0 0 0 2px #2563EB;
        }
      `}</style>
    </div>
  )
}
