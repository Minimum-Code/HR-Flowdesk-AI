'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { adminApi, getApiError } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ users: 0, categories: 0, requests: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.get('/admin/users/hrs').catch(() => ({ data: { itemsTotal: 0 } })),
      adminApi.get('/admin/users/employees').catch(() => ({ data: { itemsTotal: 0 } })),
      adminApi.get('/admin/categories').catch(() => ({ data: { itemsTotal: 0 } })),
      adminApi.get('/admin/requests').catch(() => ({ data: { itemsTotal: 0 } })),
    ]).then(([hrs, emps, cats, reqs]) => {
      setStats({
        users: (hrs.data.itemsTotal ?? 0) + (emps.data.itemsTotal ?? 0),
        categories: cats.data.itemsTotal ?? 0,
        requests: reqs.data.itemsTotal ?? 0,
      })
    }).catch((err) => toast.error(getApiError(err)))
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Total Users', value: stats.users, href: '/admin/users/employees', color: 'text-[#07472e]' },
    { label: 'Categories', value: stats.categories, href: '/admin/categories', color: 'text-blue-600' },
    { label: 'Requests', value: stats.requests, href: '/admin/tickets', color: 'text-yellow-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#07472e] tracking-tight">Admin Dashboard</h1>
        <p className="text-[#647a6b] mt-0.5">Manage your company&apos;s HR system</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href}>
            <div className="rounded-2xl bg-white border border-[#07472e]/10 p-6 hover:border-[#07472e]/30 transition-colors shadow-sm">
              <p className="text-sm text-[#647a6b]">{s.label}</p>
              {loading ? <Skeleton className="mt-2 h-8 w-12 bg-[#07472e]/10" /> : (
                <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { title: 'User Management', desc: 'Manage HR managers and employees', href: '/admin/users/employees' },
          { title: 'Form Categories', desc: 'Configure request categories and form fields', href: '/admin/categories' },
          { title: 'Request Tickets', desc: 'Overview of all submitted requests', href: '/admin/tickets' },
          { title: 'Company Settings', desc: 'Company info and subscription details', href: '/admin/settings' },
        ].map((card) => (
          <div key={card.title} className="rounded-2xl bg-white border border-[#07472e]/10 p-6 shadow-sm">
            <h3 className="font-semibold text-[#07472e]">{card.title}</h3>
            <p className="text-sm text-[#647a6b] mt-1">{card.desc}</p>
            <Link href={card.href} className="mt-4 inline-block text-sm text-[#07472e] font-medium hover:underline">
              {card.title} →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
