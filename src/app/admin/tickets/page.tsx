'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { adminApi, getApiError } from '@/lib/api'
import { Request } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  in_progress: 'bg-blue-50 text-blue-700',
  resolved: 'bg-green-50 text-[#07472e]',
  cancelled: 'bg-red-50 text-red-700',
}

export default function AdminTicketsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.get('/admin/requests', { params: { page: 1, per_page: 50 } })
      .then((res) => setRequests(res.data.items ?? res.data))
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#07472e]">All Tickets</h1>
      <div className="rounded-[32px] bg-[#ffffff] p-6">
        {loading ? (
          <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl bg-[#07472e]/5" />)}</div>
        ) : requests.length === 0 ? (
          <p className="py-10 text-center text-[#647a6b]">No tickets yet</p>
        ) : (
          <div className="space-y-2">
            {requests.map((req) => (
              <Link key={req.id} href={`/admin/tickets/${req.id}`}>
                <div className="flex items-center justify-between rounded-2xl bg-[#fbfff3] px-5 py-4 hover:bg-[#07472e]/5 transition-colors">
                  <div>
                    <p className="font-medium text-[#07472e]">{req.title}</p>
                    <p className="text-xs text-[#647a6b] mt-0.5">{new Date(req.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[req.status]}`}>
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
