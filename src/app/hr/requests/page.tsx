'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { hrApi, getApiError } from '@/lib/api'
import { Request } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  in_progress: 'bg-blue-50 text-blue-700',
  resolved: 'bg-green-50 text-[#07472e]',
  cancelled: 'bg-red-50 text-red-700',
}

export default function HRRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    hrApi.get('/hr/requests', {
      params: { page: 1, per_page: 50, ...(statusFilter !== 'all' ? { status: statusFilter } : {}) },
    })
      .then((res) => setRequests(res.data.items ?? res.data))
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setLoading(false))
  }, [statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#07472e]">Incoming Requests</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] focus:ring-[#07472e]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-[32px] bg-[#ffffff] p-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl bg-[#07472e]/5" />)}
          </div>
        ) : requests.length === 0 ? (
          <p className="py-10 text-center text-[#647a6b]">No requests found</p>
        ) : (
          <div className="space-y-2">
            {requests.map((req) => (
              <Link key={req.id} href={`/hr/requests/${req.id}`}>
                <div className="flex items-center justify-between rounded-2xl bg-[#fbfff3] px-5 py-4 hover:bg-[#07472e]/5 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      {!req.is_read_by_hr && <span className="h-2 w-2 rounded-full bg-[#07472e]" />}
                      <p className="font-medium text-[#07472e]">{req.title}</p>
                    </div>
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
