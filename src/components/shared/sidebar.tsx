'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface SidebarProps {
  navItems: NavItem[]
  role: string
}

export default function Sidebar({ navItems, role }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside className="flex h-full w-[280px] flex-col bg-[#07472e] rounded-3xl overflow-hidden shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-6">
        <img
          src="https://www.figma.com/api/mcp/asset/0eeee459-7098-406d-896a-95ac49d98452"
          alt=""
          className="h-8 w-auto"
        />
        <span className="text-[15px] font-semibold text-white tracking-tight">HR Flowdesk</span>
      </div>

      {/* Role badge */}
      <div className="mx-4 mb-3">
        <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/80 capitalize">
          {role.replace('_', ' ')}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              )}
            >
              <>{item.icon}{item.label}</>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar?.url ?? undefined} />
            <AvatarFallback className="bg-white/20 text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="truncate text-xs text-white/50">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start text-white/60 hover:text-white hover:bg-white/10"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Sign Out
        </Button>
      </div>
    </aside>
  )
}
