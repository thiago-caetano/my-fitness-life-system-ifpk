import Link from 'next/link'
import type { Profile, PersonalStudent, WorkoutSession } from '@/lib/types'

interface PersonalDashboardProps {
  profile: Profile
  students: (PersonalStudent & { student: Profile })[]
  recentSessions: (WorkoutSession & {
    student?: { full_name: string }
    workout_plan?: { name: string } | null
    workout_day?: { name: string } | null
  })[]
}

function formatDuration(seconds: number | null) {
  if (!seconds) return '--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PersonalDashboard({ profile, students, recentSessions }: PersonalDashboardProps) {
  const completedToday = recentSessions.filter((s) => {
    const today = new Date().toDateString()
    return new Date(s.started_at).toDateString() === today && s.status === 'completed'
  }).length

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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total de alunos</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{students.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Treinos hoje</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{completedToday}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total de treinos</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalSessions}</p>
        </div>
      </div>

      {/* Students quick access */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Seus Alunos</h2>
          <Link
            href="/dashboard/students"
            className="text-sm text-blue-600 font-medium hover:underline"
          >
            Ver todos
          </Link>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Nenhum aluno cadastrado ainda.</p>
            <Link href="/dashboard/students" className="text-sm text-blue-600 font-medium hover:underline mt-1 inline-block">
              Adicionar aluno
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.slice(0, 6).map(({ student }) => (
              <Link
                key={student.id}
                href={`/dashboard/students/${student.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition border border-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm font-bold uppercase">
                    {student.full_name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{student.full_name}</p>
                  <p className="text-xs text-gray-400 truncate">{student.email}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Atividade Recente dos Alunos</h2>

        {recentSessions.filter(s => s.status === 'completed').length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Nenhuma atividade registrada ainda.</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-50">
            {recentSessions.filter(s => s.status === 'completed').slice(0, 8).map((session) => (
              <div key={session.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.student?.full_name ?? 'Aluno'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {session.workout_plan?.name ?? 'Treino livre'} {session.workout_day ? `· ${session.workout_day.name}` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-gray-700">{formatDuration(session.duration_seconds)}</p>
                  <p className="text-xs text-gray-400">{formatDate(session.started_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
