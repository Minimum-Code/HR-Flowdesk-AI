'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

const PUBLIC_PATHS = ['/login', '/signup', '/reset-password']

const ROLE_DASHBOARDS: Record<string, string> = {
  employee: '/employee/dashboard',
  hr: '/hr/dashboard',
  admin: '/admin/dashboard',
  super_admin: '/super-admin/dashboard',
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchMe, user, isInitialized } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  useEffect(() => {
    if (!isInitialized) return

    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname === '/'

    if (!user && !isPublic) {
      router.replace('/login')
      return
    }

    if (user && isPublic) {
      router.replace(ROLE_DASHBOARDS[user.role] ?? '/login')
      return
    }

    if (user && pathname === '/') {
      router.replace(ROLE_DASHBOARDS[user.role] ?? '/login')
    }
  }, [isInitialized, user, pathname, router])

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#19191f]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#07472e] border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
