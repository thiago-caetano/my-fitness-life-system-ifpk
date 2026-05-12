import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudentCalendar } from '@/components/workout/student-calendar'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'student') redirect('/dashboard')

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('student_id', user.id)
    .order('started_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
        <p className="text-gray-500 text-sm mt-1">Histórico de check-ins e treinos realizados</p>
      </div>
      <StudentCalendar sessions={sessions ?? []} />
    </div>
  )
}
