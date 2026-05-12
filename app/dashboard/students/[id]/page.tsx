import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { StudentDetailClient } from '@/components/students/student-detail-client'

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'personal') redirect('/dashboard')

  // Verify this student belongs to this personal
  const { data: link } = await supabase
    .from('personal_students')
    .select('*')
    .eq('personal_id', user.id)
    .eq('student_id', id)
    .single()

  if (!link) notFound()

  const [{ data: student }, { data: plans }, { data: sessions }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase
      .from('workout_plans')
      .select('*, workout_days(*, exercises(* order by order_index asc) order by order_index asc)')
      .eq('student_id', id)
      .eq('personal_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('workout_sessions')
      .select('*, workout_plan:workout_plans(name), workout_day:workout_days(name)')
      .eq('student_id', id)
      .order('started_at', { ascending: false })
      .limit(50),
  ])

  if (!student) notFound()

  return (
    <StudentDetailClient
      student={student}
      personalId={user.id}
      initialPlans={plans ?? []}
      sessions={sessions ?? []}
    />
  )
}
