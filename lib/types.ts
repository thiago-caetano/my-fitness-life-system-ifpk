export type Role = 'personal' | 'student'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: Role
  avatar_url: string | null
  phone: string | null
  birth_date: string | null
  created_at: string
  updated_at: string
}

export interface PersonalStudent {
  id: string
  personal_id: string
  student_id: string
  active: boolean
  created_at: string
  student?: Profile
  personal?: Profile
}

export interface WorkoutPlan {
  id: string
  personal_id: string
  student_id: string
  name: string
  description: string | null
  goal: string | null
  days_per_week: number
  active: boolean
  created_at: string
  updated_at: string
  workout_days?: WorkoutDay[]
  student?: Profile
}

export interface WorkoutDay {
  id: string
  plan_id: string
  name: string
  day_label: string | null
  order_index: number
  created_at: string
  exercises?: Exercise[]
}

export interface Exercise {
  id: string
  workout_day_id: string
  name: string
  sets: number
  reps: string
  weight_kg: number | null
  rest_seconds: number
  notes: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export interface WorkoutSession {
  id: string
  student_id: string
  workout_plan_id: string | null
  workout_day_id: string | null
  started_at: string
  finished_at: string | null
  duration_seconds: number | null
  feedback_rating: number | null
  feedback_note: string | null
  status: 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  workout_plan?: WorkoutPlan
  workout_day?: WorkoutDay
}
