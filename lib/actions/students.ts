'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getMyStudents() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('personal_students')
    .select(`
      *,
      student:profiles!personal_students_student_id_fkey(*)
    `)
    .eq('personal_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) return []
  return data ?? []
}

export async function getStudentById(studentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', studentId)
    .single()

  if (error) return null
  return data
}

export async function addStudentByEmail(email: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Find the student profile
  const { data: studentProfile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .eq('role', 'student')
    .single()

  if (profileError || !studentProfile) {
    return { error: 'Aluno não encontrado. Verifique se o e-mail está correto e se o usuário se cadastrou como aluno.' }
  }

  const { error } = await supabase
    .from('personal_students')
    .upsert({
      personal_id: user.id,
      student_id: studentProfile.id,
      active: true,
    }, { onConflict: 'personal_id,student_id' })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/students')
  return { success: true, student: studentProfile }
}

export async function removeStudent(studentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('personal_students')
    .update({ active: false })
    .eq('personal_id', user.id)
    .eq('student_id', studentId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/students')
  return { success: true }
}

export async function getMyPersonal() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('personal_students')
    .select(`
      *,
      personal:profiles!personal_students_personal_id_fkey(*)
    `)
    .eq('student_id', user.id)
    .eq('active', true)
    .single()

  if (error) return null
  return data
}
