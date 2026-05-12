'use client'

import { useState, useEffect, useCallback } from 'react'
import { finishWorkoutSession } from '@/lib/actions/sessions'
import type { WorkoutSession } from '@/lib/types'

interface WorkoutTimerProps {
  session: WorkoutSession & {
    workout_plan?: { name: string } | null
    workout_day?: {
      name: string
      exercises?: {
        id: string
        name: string
        sets: number
        reps: string
        weight_kg: number | null
        rest_seconds: number
        notes: string | null
        order_index: number
      }[]
    } | null
  }
  onFinished: () => void
}

export function WorkoutTimer({ session, onFinished }: WorkoutTimerProps) {
  const [elapsed, setElapsed] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [rating, setRating] = useState(0)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const startedAt = new Date(session.started_at).getTime()
    const update = () => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [session.started_at])

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const handleFinish = useCallback(async () => {
    if (rating === 0) return
    setLoading(true)
    const result = await finishWorkoutSession(session.id, {
      feedback_rating: rating,
      feedback_note: note || undefined,
    })
    if (!result.error) {
      onFinished()
    }
    setLoading(false)
  }, [session.id, rating, note, onFinished])

  if (showFeedback) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Treino finalizado!</h2>
        <p className="text-gray-500 text-sm mb-6">Duração: {formatTime(elapsed)} — Como foi o treino?</p>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Avaliação</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 transition"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill={star <= rating ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Comentário <span className="text-gray-400 font-normal">(opcional)</span></label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Como foi o treino hoje? Alguma observação..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>

          <button
            onClick={handleFinish}
            disabled={rating === 0 || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition"
          >
            {loading ? 'Salvando...' : 'Salvar e finalizar'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Timer header */}
      <div className="bg-blue-600 p-6 text-center">
        <p className="text-blue-100 text-sm font-medium mb-1">
          {session.workout_plan?.name ?? 'Treino livre'} {session.workout_day ? `· ${session.workout_day.name}` : ''}
        </p>
        <div className="text-5xl font-bold text-white tabular-nums tracking-tight">
          {formatTime(elapsed)}
        </div>
        <p className="text-blue-200 text-xs mt-2">Treino em andamento</p>
      </div>

      {/* Exercises */}
      {session.workout_day?.exercises && session.workout_day.exercises.length > 0 && (
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Exercícios de hoje</h3>
          <div className="flex flex-col gap-2">
            {session.workout_day.exercises.map((ex) => (
              <div key={ex.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                  <p className="text-xs text-gray-400">
                    {ex.sets}x{ex.reps}
                    {ex.weight_kg ? ` · ${ex.weight_kg}kg` : ''}
                    {` · ${ex.rest_seconds}s descanso`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 pb-6">
        <button
          onClick={() => setShowFeedback(true)}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl text-sm transition"
        >
          Finalizar treino
        </button>
      </div>
    </div>
  )
}
