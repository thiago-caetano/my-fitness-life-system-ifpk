'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Profile, WorkoutPlan, WorkoutSession } from '@/lib/types'
import { WorkoutPlanManager } from '@/components/workout/workout-plan-manager'
import { StudentCalendar } from '@/components/workout/student-calendar'

interface StudentDetailClientProps {
  student: Profile
  personalId: string
  initialPlans: WorkoutPlan[]
  sessions: WorkoutSession[]
}

function formatDuration(seconds: number | null) {
  if (!seconds) return '--'
  const m = Math.floor(seconds / 60)
  return `${m}min`
}

export function StudentDetailClient({ student, personalId, initialPlans, sessions }: StudentDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'workouts' | 'calendar'>('overview')
  const [plans, setPlans] = useState(initialPlans)

  const completedSessions = sessions.filter(s => s.status === 'completed')
  const totalMinutes = completedSessions.reduce((acc, s) => acc + Math.floor((s.duration_seconds ?? 0) / 60), 0)

  const tabs = [
    { key: 'overview', label: 'Visão geral' },
    { key: 'workouts', label: 'Treinos' },
    { key: 'calendar', label: 'Calendário' },
  ] as const

  return (
    <div className="flex flex-col gap-6">
      {/* Back + Header */}
      <div>
        <Link href="/dashboard/students" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-4 transition">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Voltar para alunos
        </Link>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 text-xl font-bold uppercase">{student.full_name.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{student.full_name}</h1>
            <p className="text-sm text-gray-400">{student.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Treinos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{completedSessions.length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Minutos</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{totalMinutes}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Planos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{plans.length}</p>
            </div>
          </div>

          {/* Recent sessions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Histórico de treinos</h2>
            {completedSessions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Nenhum treino registrado ainda.</p>
            ) : (
              <div className="flex flex-col divide-y divide-gray-50">
                {completedSessions.slice(0, 10).map((session) => (
                  <div key={session.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(session.started_at).toLocaleDateString('pt-BR', {
                          weekday: 'short', day: '2-digit', month: 'short'
                        })}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Duração: {formatDuration(session.duration_seconds)}
                      </p>
                      {session.feedback_note && (
                        <p className="text-xs text-gray-500 italic mt-1">"{session.feedback_note}"</p>
                      )}
                    </div>
                    {session.feedback_rating && (
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < session.feedback_rating! ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Workouts */}
      {activeTab === 'workouts' && (
        <WorkoutPlanManager
          student={student}
          personalId={personalId}
          initialPlans={plans}
          onPlansChange={setPlans}
        />
      )}

      {/* Calendar */}
      {activeTab === 'calendar' && (
        <StudentCalendar sessions={sessions} />
      )}
    </div>
  )
}
