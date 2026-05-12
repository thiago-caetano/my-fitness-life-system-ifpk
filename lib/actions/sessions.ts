'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function startWorkoutSession(data: {
  workout_plan_id?: string
  workout_day_id?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Cancel any in_progress session first
  await supabase
    .from('workout_sessions')
    .update({ status: 'cancelled', finished_at: new Date().toISOString() })
    .eq('student_id', user.id)
    .eq('status', 'in_progress')

  const { data: session, error } = await supabase
    .from('workout_sessions')
    .insert({
      student_id: user.id,
      workout_plan_id: data.workout_plan_id ?? null,
      workout_day_id: data.workout_day_id ?? null,
      started_at: new Date().toISOString(),
      status: 'in_progress',
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true, session }
}

export async function finishWorkoutSession(sessionId: string, data: {
  feedback_rating: number
  feedback_note?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Get session to calculate duration
  const { data: session } = await supabase
    .from('workout_sessions')
    .select('started_at')
    .eq('id', sessionId)
    .single()

  const finishedAt = new Date()
  const durationSeconds = session
    ? Math.floor((finishedAt.getTime() - new Date(session.started_at).getTime()) / 1000)
    : null

  const { error } = await supabase
    .from('workout_sessions')
    .update({
      status: 'completed',
      finished_at: finishedAt.toISOString(),
      duration_seconds: durationSeconds,
      feedback_rating: data.feedback_rating,
      feedback_note: data.feedback_note ?? null,
    })
    .eq('id', sessionId)
    .eq('student_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function getActiveSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      workout_plan:workout_plans(*),
      workout_day:workout_days(*, exercises(* order by order_index asc))
    `)
    .eq('student_id', user.id)
    .eq('status', 'in_progress')
    .single()

  return data ?? null
}

export async function getMyWorkoutSessions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      workout_plan:workout_plans(name),
      workout_day:workout_days(name)
    `)
    .eq('student_id', user.id)
    .order('started_at', { ascending: false })

  if (error) return []
  return data ?? []
}

export async function getStudentSessions(studentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      workout_plan:workout_plans(name),
      workout_day:workout_days(name)
    `)
    .eq('student_id', studentId)
    .order('started_at', { ascending: false })

  if (error) return []
  return data ?? []
}
