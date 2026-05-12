'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// ---- Workout Plans ----

export async function getWorkoutPlansForStudent(studentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('workout_plans')
    .select(`
      *,
      workout_days(
        *,
        exercises(* order by order_index asc)
        order by order_index asc
      )
    `)
    .eq('student_id', studentId)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) return []
  return data ?? []
}

export async function getMyWorkoutPlans() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('workout_plans')
    .select(`
      *,
      workout_days(
        *,
        exercises(* order by order_index asc)
        order by order_index asc
      )
    `)
    .eq('student_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) return []
  return data ?? []
}

export async function createWorkoutPlan(data: {
  student_id: string
  name: string
  description?: string
  goal?: string
  days_per_week?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: plan, error } = await supabase
    .from('workout_plans')
    .insert({
      personal_id: user.id,
      student_id: data.student_id,
      name: data.name,
      description: data.description ?? null,
      goal: data.goal ?? null,
      days_per_week: data.days_per_week ?? 3,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard/students')
  return { success: true, plan }
}

export async function updateWorkoutPlan(planId: string, data: {
  name?: string
  description?: string
  goal?: string
  days_per_week?: number
  active?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('workout_plans')
    .update(data)
    .eq('id', planId)
    .eq('personal_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/students')
  return { success: true }
}

export async function deleteWorkoutPlan(planId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('workout_plans')
    .update({ active: false })
    .eq('id', planId)
    .eq('personal_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/students')
  return { success: true }
}

// ---- Workout Days ----

export async function createWorkoutDay(data: {
  plan_id: string
  name: string
  day_label?: string
  order_index?: number
}) {
  const supabase = await createClient()

  const { data: day, error } = await supabase
    .from('workout_days')
    .insert({
      plan_id: data.plan_id,
      name: data.name,
      day_label: data.day_label ?? null,
      order_index: data.order_index ?? 0,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard/students')
  return { success: true, day }
}

export async function updateWorkoutDay(dayId: string, data: {
  name?: string
  day_label?: string
  order_index?: number
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('workout_days')
    .update(data)
    .eq('id', dayId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/students')
  return { success: true }
}

export async function deleteWorkoutDay(dayId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('workout_days')
    .delete()
    .eq('id', dayId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/students')
  return { success: true }
}

// ---- Exercises ----

export async function createExercise(data: {
  workout_day_id: string
  name: string
  sets?: number
  reps?: string
  weight_kg?: number
  rest_seconds?: number
  notes?: string
  order_index?: number
}) {
  const supabase = await createClient()

  const { data: exercise, error } = await supabase
    .from('exercises')
    .insert({
      workout_day_id: data.workout_day_id,
      name: data.name,
      sets: data.sets ?? 3,
      reps: data.reps ?? '12',
      weight_kg: data.weight_kg ?? null,
      rest_seconds: data.rest_seconds ?? 60,
      notes: data.notes ?? null,
      order_index: data.order_index ?? 0,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard/students')
  return { success: true, exercise }
}

export async function updateExercise(exerciseId: string, data: {
  name?: string
  sets?: number
  reps?: string
  weight_kg?: number | null
  rest_seconds?: number
  notes?: string | null
  order_index?: number
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('exercises')
    .update(data)
    .eq('id', exerciseId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/students')
  return { success: true }
}

export async function deleteExercise(exerciseId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', exerciseId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/students')
  return { success: true }
}
