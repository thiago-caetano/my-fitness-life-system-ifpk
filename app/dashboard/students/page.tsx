import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StudentsClient } from '@/components/students/students-client'

export default async function StudentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'personal') redirect('/dashboard')

  const { data: students } = await supabase
    .from('personal_students')
    .select('*, student:profiles!personal_students_student_id_fkey(*)')
    .eq('personal_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alunos</h1>
          <p className="text-gray-500 text-sm mt-1">{(students ?? []).length} aluno{(students ?? []).length !== 1 ? 's' : ''} cadastrado{(students ?? []).length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <StudentsClient initialStudents={students ?? []} />
    </div>
  )
}
