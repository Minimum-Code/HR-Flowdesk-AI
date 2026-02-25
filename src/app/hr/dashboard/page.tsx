'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { hrApi, getApiError } from '@/lib/api'
import { Request } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  in_progress: 'bg-blue-50 text-blue-700',
  resolved: 'bg-green-50 text-[#07472e]',
  cancelled: 'bg-red-50 text-red-700',
  rejected: 'bg-red-50 text-red-700',
}

export default function HRDashboard() {
  const { user } = useAuthStore()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 })

  useEffect(() => {
    hrApi.get('/hr/requests', { params: { page: 1, per_page: 10 } })
      .then((res) => {
        const items: Request[] = res.data.items ?? res.data
        setRequests(items)
        setStats({
          total: res.data.itemsTotal ?? items.length,
          pending: items.filter((r) => r.status === 'pending').length,
          inProgress: items.filter((r) => r.status === 'in_progress').length,
          resolved: items.filter((r) => r.status === 'resolved').length,
        })
      })
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#07472e] tracking-tight">Hello, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-[#647a6b] mt-0.5">Manage incoming employee requests</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-[#07472e]' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-blue-600' },
          { label: 'Resolved', value: stats.resolved, color: 'text-[#07472e]' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white border border-[#07472e]/10 p-5 shadow-sm">
            <p className="text-sm text-[#647a6b]">{s.label}</p>
            {loading ? <Skeleton className="mt-2 h-8 w-12 bg-[#07472e]/10" /> : (
              <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-[#07472e]/10 p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#07472e]">Incoming Requests</h2>
          <Link href="/hr/requests" className="text-sm text-[#07472e] hover:underline font-medium">View all</Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl bg-[#07472e]/5" />)}
          </div>
        ) : requests.length === 0 ? (
          <p className="py-10 text-center text-[#647a6b]">No requests yet</p>
        ) : (
          <div className="space-y-2">
            {requests.map((req) => (
              <Link key={req.id} href={`/hr/requests/${req.id}`}>
                <div className="flex items-center justify-between rounded-xl bg-[#fbfff3] px-4 py-3 hover:bg-[#f0f9f4] transition-colors">
                  <div>
                    <p className="font-medium text-[#07472e]">{req.title}</p>
                    <p className="text-xs text-[#647a6b] mt-0.5">{new Date(req.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!req.is_read_by_hr && <span className="h-2 w-2 rounded-full bg-[#07472e]" />}
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[req.status] ?? 'bg-gray-50 text-gray-600'}`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
