'use client'

import { useState } from 'react'
import type { WorkoutSession } from '@/lib/types'

interface StudentCalendarProps {
  sessions: WorkoutSession[]
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function StudentCalendar({ sessions }: StudentCalendarProps) {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  // Map sessions by date string
  const sessionsByDate: Record<string, WorkoutSession[]> = {}
  sessions.forEach((s) => {
    const dateKey = new Date(s.started_at).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })
    if (!sessionsByDate[dateKey]) sessionsByDate[dateKey] = []
    sessionsByDate[dateKey].push(s)
  })

  function getDateKey(day: number) {
    return new Date(year, month, day).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDay(null)
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDay(null)
  }

  const selectedSessions = selectedDay ? (sessionsByDate[selectedDay] ?? []) : []

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-50 transition text-gray-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 className="text-base font-semibold text-gray-900">
            {MONTHS[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-50 transition text-gray-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateKey = getDateKey(day)
            const daySessions = sessionsByDate[dateKey] ?? []
            const hasCompleted = daySessions.some(s => s.status === 'completed')
            const hasMissed = daySessions.some(s => s.status === 'cancelled')
            const isToday = new Date(year, month, day).toDateString() === today.toDateString()
            const isSelected = dateKey === selectedDay
            const isFuture = new Date(year, month, day) > today

            return (
              <button
                key={day}
                onClick={() => !isFuture && setSelectedDay(isSelected ? null : dateKey)}
                disabled={isFuture}
                className={`relative flex flex-col items-center justify-center h-10 w-full rounded-xl text-sm font-medium transition
                  ${isSelected ? 'bg-blue-600 text-white' : ''}
                  ${!isSelected && hasCompleted ? 'bg-blue-50 text-blue-700' : ''}
                  ${!isSelected && !hasCompleted && !isFuture ? 'hover:bg-gray-50 text-gray-700' : ''}
                  ${isFuture ? 'text-gray-200 cursor-default' : ''}
                  ${isToday && !isSelected ? 'ring-2 ring-blue-300' : ''}
                `}
              >
                {day}
                {hasCompleted && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500" />
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300" />
            <span className="text-xs text-gray-400">Treinou</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2 border-blue-300" />
            <span className="text-xs text-gray-400">Hoje</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gray-100" />
            <span className="text-xs text-gray-400">Sem treino</span>
          </div>
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{selectedDay}</h3>
          {selectedSessions.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum treino registrado neste dia.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {selectedSessions.map((session) => (
                <div key={session.id} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-gray-50">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        session.status === 'completed' ? 'bg-green-500' :
                        session.status === 'in_progress' ? 'bg-yellow-500' : 'bg-red-400'
                      }`} />
                      <span className="text-sm font-medium text-gray-900">
                        {session.status === 'completed' ? 'Treino concluído' :
                         session.status === 'in_progress' ? 'Em andamento' : 'Cancelado'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Início: {new Date(session.started_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      {session.duration_seconds && ` · Duração: ${Math.floor(session.duration_seconds / 60)}min`}
                    </p>
                    {session.feedback_note && (
                      <p className="text-xs text-gray-500 italic mt-1">"{session.feedback_note}"</p>
                    )}
                  </div>
                  {session.feedback_rating && (
                    <div className="flex gap-0.5 flex-shrink-0">
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
      )}
    </div>
  )
}
