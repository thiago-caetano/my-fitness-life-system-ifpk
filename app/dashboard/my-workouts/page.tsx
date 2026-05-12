import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MyWorkoutsClient } from '@/components/workout/my-workouts-client'

export default async function MyWorkoutsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'student') redirect('/dashboard')

  const { data: plans } = await supabase
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meus Treinos</h1>
        <p className="text-gray-500 text-sm mt-1">Planos de treino atribuídos pelo seu personal</p>
      </div>
      <MyWorkoutsClient plans={plans ?? []} />
    </div>
  )
}
