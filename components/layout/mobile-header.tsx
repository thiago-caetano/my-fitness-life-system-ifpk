'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'
import type { Profile } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MobileHeaderProps {
  profile: Profile
}

const personalNav = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Alunos', href: '/dashboard/students' },
  { label: 'Perfil', href: '/dashboard/profile' },
]

const studentNav = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Meus Treinos', href: '/dashboard/my-workouts' },
  { label: 'Calendário', href: '/dashboard/calendar' },
  { label: 'Perfil', href: '/dashboard/profile' },
]

export function MobileHeader({ profile }: MobileHeaderProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const navItems = profile.role === 'personal' ? personalNav : studentNav

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-900">My Fitness Life</span>
        </div>
        <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-gray-50 transition">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-900">My Fitness Life</span>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="px-3 py-4 border-t border-gray-100">
              <div className="px-3 py-2 mb-2">
                <p className="text-xs font-semibold text-gray-900">{profile.full_name}</p>
                <p className="text-xs text-gray-400">{profile.role === 'personal' ? 'Personal Trainer' : 'Aluno'}</p>
              </div>
              <form action={signOut}>
                <button type="submit" className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Sair
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
