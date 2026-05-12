import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PersonalDashboard } from '@/components/dashboard/personal-dashboard'
import { StudentDashboard } from '@/components/dashboard/student-dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  if (profile.role === 'personal') {
    // Fetch personal stats
    const [{ data: students }, { data: recentSessions }] = await Promise.all([
      supabase
        .from('personal_students')
        .select('*, student:profiles!personal_students_student_id_fkey(*)')
        .eq('personal_id', user.id)
        .eq('active', true),
      supabase
        .from('workout_sessions')
        .select('*, student:profiles!workout_sessions_student_id_fkey(full_name), workout_plan:workout_plans(name), workout_day:workout_days(name)')
        .in(
          'student_id',
          (await supabase.from('personal_students').select('student_id').eq('personal_id', user.id).eq('active', true)).data?.map(r => r.student_id) ?? []
        )
        .order('started_at', { ascending: false })
        .limit(10),
    ])

    return (
      <PersonalDashboard
        profile={profile}
        students={students ?? []}
        recentSessions={recentSessions ?? []}
      />
    )
  }

  // Student view
  const [{ data: plans }, { data: activeSession }, { data: sessions }] = await Promise.all([
    supabase
      .from('workout_plans')
      .select('*, workout_days(*, exercises(* order by order_index asc) order by order_index asc)')
      .eq('student_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('workout_sessions')
      .select('*, workout_plan:workout_plans(name), workout_day:workout_days(name, exercises(* order by order_index asc))')
      .eq('student_id', user.id)
      .eq('status', 'in_progress')
      .single(),
    supabase
      .from('workout_sessions')
      .select('*')
      .eq('student_id', user.id)
      .order('started_at', { ascending: false })
      .limit(30),
  ])

  return (
    <StudentDashboard
      profile={profile}
      plans={plans ?? []}
      activeSession={activeSession ?? null}
      recentSessions={sessions ?? []}
    />
  )
}
