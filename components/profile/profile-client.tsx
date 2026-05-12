'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

interface ProfileClientProps {
  profile: Profile
}

export function ProfileClient({ profile }: ProfileClientProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: form.get('full_name') as string,
        phone: form.get('phone') as string || null,
        birth_date: form.get('birth_date') as string || null,
      })
      .eq('id', profile.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      {/* Avatar section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <span className="text-blue-600 text-2xl font-bold uppercase">{profile.full_name.charAt(0)}</span>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{profile.full_name}</p>
          <p className="text-sm text-gray-400">{profile.email}</p>
          <span className={`inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${
            profile.role === 'personal'
              ? 'bg-blue-50 text-blue-600'
              : 'bg-green-50 text-green-600'
          }`}>
            {profile.role === 'personal' ? 'Personal Trainer' : 'Aluno'}
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Informações pessoais</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Nome completo</label>
            <input
              name="full_name"
              defaultValue={profile.full_name}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">E-mail</label>
            <input
              value={profile.email}
              disabled
              className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Telefone</label>
            <input
              name="phone"
              defaultValue={profile.phone ?? ''}
              placeholder="(11) 99999-9999"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Data de nascimento</label>
            <input
              name="birth_date"
              type="date"
              defaultValue={profile.birth_date ?? ''}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {success && (
            <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
              Perfil atualizado com sucesso!
            </div>
          )}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="self-start bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl text-sm transition"
          >
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
