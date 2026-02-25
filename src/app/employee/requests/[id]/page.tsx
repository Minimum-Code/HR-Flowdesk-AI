'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { employeeApi, getApiError } from '@/lib/api'
import { Request, RequestFieldValue, HrResponse } from '@/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  in_progress: 'bg-blue-50 text-blue-700',
  resolved: 'bg-green-50 text-[#07472e]',
  cancelled: 'bg-red-50 text-red-700',
}

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [request, setRequest] = useState<Request | null>(null)
  const [fieldValues, setFieldValues] = useState<RequestFieldValue[]>([])
  const [responses, setResponses] = useState<HrResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    employeeApi.get('/employee/requests/detail', { params: { request_id: Number(id) } })
      .then((res) => {
        setRequest(res.data.request)
        setFieldValues(res.data.field_values ?? [])
        setResponses(res.data.responses ?? [])
      })
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setLoading(false))
  }, [id])

  async function handleCancel() {
    if (!confirm('Cancel this request?')) return
    setCancelling(true)
    try {
      await employeeApi.patch('/employee/requests/cancel', { request_id: Number(id) })
      toast.success('Request cancelled')
      router.push('/employee/requests')
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return (
    <div className="max-w-2xl space-y-4">
      <Skeleton className="h-8 w-64 bg-[#07472e]/5" />
      <Skeleton className="h-64 rounded-[32px] bg-[#07472e]/5" />
    </div>
  )

  if (!request) return <p className="text-[#647a6b]">Request not found</p>

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-[#647a6b] hover:text-[#07472e]">←</button>
        <h1 className="text-xl font-bold text-[#07472e] flex-1">{request.title}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[request.status]}`}>
          {request.status.replace('_', ' ')}
        </span>
      </div>

      <div className="rounded-[32px] bg-[#ffffff] p-6 space-y-4">
        <div className="text-xs text-[#647a6b]">Submitted {new Date(request.created_at).toLocaleString()}</div>
        {fieldValues.map((fv) => (
          <div key={fv.id}>
            <p className="text-xs text-[#647a6b] mb-1">{fv.field_label}</p>
            <p className="text-[#07472e]">{fv.field_value}</p>
          </div>
        ))}
      </div>

      {responses.length > 0 && (
        <div className="rounded-[32px] bg-[#ffffff] p-6">
          <h2 className="font-semibold text-[#07472e] mb-4">HR Response</h2>
          {responses.map((r) => (
            <div key={r.id} className="rounded-2xl bg-[#07472e]/10 border border-[#07472e]/20 p-4">
              <p className="text-[#07472e]">{r.content}</p>
              <p className="text-xs text-[#647a6b] mt-2">{new Date(r.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {request.status === 'pending' && (
        <Button
          variant="outline"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          onClick={handleCancel}
          disabled={cancelling}
        >
          {cancelling ? 'Cancelling...' : 'Cancel Request'}
        </Button>
      )}
    </div>
  )
}
