'use client'

import { useState } from 'react'
import Link from 'next/link'
import { addStudentByEmail, removeStudent } from '@/lib/actions/students'
import type { PersonalStudent, Profile } from '@/lib/types'

interface StudentsClientProps {
  initialStudents: (PersonalStudent & { student: Profile })[]
}

export function StudentsClient({ initialStudents }: StudentsClientProps) {
  const [students, setStudents] = useState(initialStudents)
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMsg('')
    const result = await addStudentByEmail(email)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccessMsg(`${result.student?.full_name} adicionado com sucesso!`)
      setEmail('')
      setShowForm(false)
      // Optimistically add
      if (result.student) {
        setStudents(prev => [...prev, {
          id: crypto.randomUUID(),
          personal_id: '',
          student_id: result.student!.id,
          active: true,
          created_at: new Date().toISOString(),
          student: result.student!,
        }])
      }
    }
    setLoading(false)
  }

  async function handleRemove(studentId: string) {
    if (!confirm('Remover este aluno da sua lista?')) return
    await removeStudent(studentId)
    setStudents(prev => prev.filter(s => s.student_id !== studentId))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Success message */}
      {successMsg && (
        <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      {/* Add student */}
      {showForm ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Adicionar aluno</h2>
          <p className="text-sm text-gray-400 mb-4">O aluno deve se cadastrar primeiro no sistema como &quot;Aluno&quot;.</p>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="E-mail do aluno"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition"
              >
                {loading ? 'Buscando...' : 'Adicionar'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError('') }}
                className="px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 self-start bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Adicionar aluno
        </button>
      )}

      {/* List */}
      {students.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Nenhum aluno cadastrado</p>
          <p className="text-gray-400 text-sm mt-1">Adicione um aluno usando o botão acima.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {students.map(({ student }) => (
            <div key={student.id} className="flex items-center justify-between p-4 gap-4">
              <Link
                href={`/dashboard/students/${student.id}`}
                className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm font-bold uppercase">
                    {student.full_name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{student.full_name}</p>
                  <p className="text-xs text-gray-400 truncate">{student.email}</p>
                </div>
              </Link>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/dashboard/students/${student.id}`}
                  className="text-xs text-blue-600 font-medium hover:underline px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
                >
                  Ver detalhes
                </Link>
                <button
                  onClick={() => handleRemove(student.id)}
                  className="p-1.5 text-gray-300 hover:text-red-400 transition rounded-lg hover:bg-red-50"
                  title="Remover aluno"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" /><path d="M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
