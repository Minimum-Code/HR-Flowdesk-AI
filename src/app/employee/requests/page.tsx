'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { employeeApi, getApiError } from '@/lib/api'
import { Request } from '@/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  in_progress: 'bg-blue-50 text-blue-700',
  resolved: 'bg-green-50 text-[#07472e]',
  cancelled: 'bg-red-50 text-red-700',
}

const PRIORITY_COLOR: Record<string, string> = {
  low: 'text-[#647a6b]',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  urgent: 'text-red-400',
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  async function load(p = 1) {
    setLoading(true)
    try {
      const res = await employeeApi.get('/employee/requests', {
        params: { page: p, per_page: 20 },
      })
      const items: Request[] = res.data.items ?? res.data
      setRequests(p === 1 ? items : (prev) => [...prev, ...items])
      setHasMore(res.data.nextPage != null)
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#07472e]">My Requests</h1>
        <Link href="/employee/requests/new">
          <Button className="bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] font-semibold">
            + New Request
          </Button>
        </Link>
      </div>

      <div className="rounded-[32px] bg-[#ffffff] p-6">
        {loading && requests.length === 0 ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl bg-[#07472e]/5" />)}
          </div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[#647a6b]">No requests yet</p>
            <Link href="/employee/requests/new">
              <Button variant="outline" className="mt-4 border-[#07472e]/20 text-[#07472e] hover:bg-[#07472e]/5">
                Submit a request
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {requests.map((req) => (
                <Link key={req.id} href={`/employee/requests/${req.id}`}>
                  <div className="flex items-center justify-between rounded-2xl bg-[#fbfff3] px-5 py-4 hover:bg-[#07472e]/5 transition-colors">
                    <div className="min-w-0">
                      <p className="font-medium text-[#07472e] truncate">{req.title}</p>
                      <p className="text-xs text-[#647a6b] mt-0.5">
                        {new Date(req.created_at).toLocaleDateString()} &middot;{' '}
                        <span className={PRIORITY_COLOR[req.priority]}>{req.priority}</span>
                      </p>
                    </div>
                    <span className={`ml-4 shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[req.status]}`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {hasMore && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  className="border-[#07472e]/20 text-[#07472e] hover:bg-[#07472e]/5"
                  onClick={() => { const next = page + 1; setPage(next); load(next) }}
                  disabled={loading}
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
