'use client'

import { useState } from 'react'
import type { Profile, WorkoutPlan, WorkoutSession } from '@/lib/types'
import { WorkoutTimer } from '@/components/workout/workout-timer'
import { WorkoutSelector } from '@/components/workout/workout-selector'

interface StudentDashboardProps {
  profile: Profile
  plans: WorkoutPlan[]
  activeSession: (WorkoutSession & {
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
  }) | null
  recentSessions: WorkoutSession[]
}

function getStreakDays(sessions: WorkoutSession[]): number {
  const completed = sessions
    .filter(s => s.status === 'completed')
    .map(s => new Date(s.started_at).toDateString())
  const unique = [...new Set(completed)]

  let streak = 0
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (unique.includes(d.toDateString())) {
      streak++
    } else if (i > 0) break
  }
  return streak
}

function getWeekDays(sessions: WorkoutSession[]) {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const week: { label: string; trained: boolean; isToday: boolean }[] = []
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())

  const completedDates = sessions
    .filter(s => s.status === 'completed')
    .map(s => new Date(s.started_at).toDateString())

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    week.push({
      label: days[i],
      trained: completedDates.includes(d.toDateString()),
      isToday: d.toDateString() === today.toDateString(),
    })
  }
  return week
}

export function StudentDashboard({ profile, plans, activeSession: initialActiveSession, recentSessions }: StudentDashboardProps) {
  const [activeSession, setActiveSession] = useState(initialActiveSession)
  const [showSelector, setShowSelector] = useState(false)

  const streak = getStreakDays(recentSessions)
  const weekDays = getWeekDays(recentSessions)
  const totalSessions = recentSessions.filter(s => s.status === 'completed').length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 text-balance">
          Olá, {profile.full_name.split(' ')[0]}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Active Session or Start Button */}
      {activeSession ? (
        <WorkoutTimer
          session={activeSession}
          onFinished={() => setActiveSession(null)}
        />
      ) : showSelector ? (
        <WorkoutSelector
          plans={plans}
          onSessionStarted={(session) => {
            setActiveSession(session as typeof activeSession)
            setShowSelector(false)
          }}
          onCancel={() => setShowSelector(false)}
        />
      ) : (
        <div className="bg-blue-600 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/80 text-sm font-medium">Pronto para treinar?</p>
            <p className="text-white text-lg font-bold mt-0.5">
              {plans.length > 0
                ? `Você tem ${plans.length} plano${plans.length > 1 ? 's' : ''} ativo${plans.length > 1 ? 's' : ''}`
                : 'Nenhum plano atribuído ainda'}
            </p>
          </div>
          {plans.length > 0 && (
            <button
              onClick={() => setShowSelector(true)}
              className="flex-shrink-0 bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-blue-50 transition"
            >
              Iniciar Treino
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Sequência</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{streak}</p>
          <p className="text-xs text-gray-400 mt-0.5">dias</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalSessions}</p>
          <p className="text-xs text-gray-400 mt-0.5">treinos</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Planos</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{plans.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">ativos</p>
        </div>
      </div>

      {/* Week summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Semana atual</h2>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-xs text-gray-400 font-medium">{day.label}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition ${
                day.trained
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : day.isToday
                  ? 'border-blue-300 text-blue-600 bg-blue-50'
                  : 'border-gray-100 text-gray-300 bg-gray-50'
              }`}>
                {day.trained ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent sessions */}
      {recentSessions.filter(s => s.status === 'completed').length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Treinos recentes</h2>
          <div className="flex flex-col divide-y divide-gray-50">
            {recentSessions.filter(s => s.status === 'completed').slice(0, 5).map((session) => (
              <div key={session.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Treino concluído</p>
                    <p className="text-xs text-gray-400">
                      {new Date(session.started_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {session.duration_seconds && (
                    <p className="text-xs font-medium text-gray-700">
                      {Math.floor(session.duration_seconds / 60)}min
                    </p>
                  )}
                  {session.feedback_rating && (
                    <div className="flex items-center gap-0.5 justify-end mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill={i < session.feedback_rating! ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
