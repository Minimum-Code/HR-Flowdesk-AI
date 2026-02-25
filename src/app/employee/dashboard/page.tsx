'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { employeeApi, getApiError } from '@/lib/api'
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

export default function EmployeeDashboard() {
  const { user } = useAuthStore()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 })

  useEffect(() => {
    async function load() {
      try {
        const res = await employeeApi.get('/employee/requests', {
          params: { page: 1, per_page: 5 },
        })
        const items: Request[] = res.data.items ?? res.data
        setRequests(items)
        setStats({
          total: res.data.itemsTotal ?? items.length,
          pending: items.filter((r) => r.status === 'pending').length,
          inProgress: items.filter((r) => r.status === 'in_progress').length,
          resolved: items.filter((r) => r.status === 'resolved').length,
        })
      } catch (err) {
        toast.error(getApiError(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#07472e] tracking-tight">
            Hello, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-[#647a6b] mt-0.5">Here&apos;s what&apos;s happening with your requests</p>
        </div>
        <Link
          href="/employee/requests/new"
          className="bg-[#07472e] text-[#fbfff3] rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[#05351f] transition"
        >
          + New Request
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-[#07472e]' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-blue-600' },
          { label: 'Resolved', value: stats.resolved, color: 'text-[#07472e]' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white border border-[#07472e]/10 p-5 shadow-sm">
            <p className="text-sm text-[#647a6b]">{s.label}</p>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-12 bg-[#07472e]/10" />
            ) : (
              <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Recent requests */}
      <div className="rounded-2xl bg-white border border-[#07472e]/10 p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#07472e]">Recent Requests</h2>
          <Link href="/employee/requests" className="text-sm text-[#07472e] hover:underline font-medium">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl bg-[#07472e]/5" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[#647a6b]">No requests yet</p>
            <Link
              href="/employee/requests/new"
              className="mt-4 inline-block border border-[#07472e] text-[#07472e] rounded-xl px-4 py-2 text-sm hover:bg-[#07472e]/5 transition"
            >
              Submit your first request
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {requests.map((req) => (
              <Link key={req.id} href={`/employee/requests/${req.id}`}>
                <div className="flex items-center justify-between rounded-xl bg-[#fbfff3] px-4 py-3 hover:bg-[#f0f9f4] transition-colors">
                  <div>
                    <p className="font-medium text-[#07472e]">{req.title}</p>
                    <p className="text-xs text-[#647a6b] mt-0.5">
                      {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[req.status] ?? 'bg-gray-50 text-gray-600'}`}>
                    {req.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
