'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { hrApi, getApiError } from '@/lib/api'
import { User, Request } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  in_progress: 'bg-blue-50 text-blue-700',
  resolved: 'bg-green-50 text-[#07472e]',
  cancelled: 'bg-red-50 text-red-700',
}

export default function HREmployeeProfilePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams.get('user_id')
  const [employee, setEmployee] = useState<User | null>(null)
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    hrApi.get('/hr/employee/profile', { params: { employee_id: Number(userId) } })
      .then((res) => {
        setEmployee(res.data.employee)
        setRequests(res.data.requests ?? [])
      })
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setLoading(false))
  }, [userId])

  if (!userId) return <p className="text-[#647a6b]">No user specified</p>

  if (loading) return (
    <div className="max-w-2xl space-y-4">
      <Skeleton className="h-8 w-64 bg-[#07472e]/5" />
      <Skeleton className="h-32 rounded-[32px] bg-[#07472e]/5" />
    </div>
  )

  if (!employee) return <p className="text-[#647a6b]">Employee not found</p>

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-[#647a6b] hover:text-[#07472e]">←</button>
        <h1 className="text-xl font-bold text-[#07472e]">Employee Profile</h1>
      </div>

      <div className="rounded-[32px] bg-[#ffffff] p-6 flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-[#07472e] flex items-center justify-center text-xl font-bold text-[#fbfff3]">
          {employee.name?.[0]}
        </div>
        <div>
          <p className="text-lg font-semibold text-[#07472e]">{employee.name}</p>
          <p className="text-[#647a6b]">{employee.email}</p>
        </div>
      </div>

      <div className="rounded-[32px] bg-[#ffffff] p-6">
        <h2 className="font-semibold text-[#07472e] mb-4">Request History ({requests.length})</h2>
        {requests.length === 0 ? (
          <p className="text-[#647a6b] text-sm py-6 text-center">No requests submitted</p>
        ) : (
          <div className="space-y-2">
            {requests.map((req) => (
              <Link key={req.id} href={`/hr/requests/${req.id}`}>
                <div className="flex items-center justify-between rounded-2xl bg-[#fbfff3] px-4 py-3 hover:bg-[#f0f9f4] transition-colors">
                  <div>
                    <p className="font-medium text-[#07472e]">{req.title}</p>
                    <p className="text-xs text-[#647a6b] mt-0.5">{new Date(req.created_at).toLocaleDateString()}</p>
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
