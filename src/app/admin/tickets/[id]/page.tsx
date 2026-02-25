'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { adminApi, getApiError } from '@/lib/api'
import { Request, RequestFieldValue, Note, HrResponse, User, Tag } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  in_progress: 'bg-blue-50 text-blue-700',
  resolved: 'bg-green-50 text-[#07472e]',
  cancelled: 'bg-red-50 text-red-700',
}

export default function AdminTicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [request, setRequest] = useState<Request | null>(null)
  const [employee, setEmployee] = useState<User | null>(null)
  const [fieldValues, setFieldValues] = useState<RequestFieldValue[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [responses, setResponses] = useState<HrResponse[]>([])
  const [requestTags, setRequestTags] = useState<Tag[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [selectedTagId, setSelectedTagId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.get('/admin/requests/detail', { params: { request_id: Number(id) } })
      .then((res) => {
        setRequest(res.data.request)
        setEmployee(res.data.employee)
        setFieldValues(res.data.field_values ?? [])
        setNotes(res.data.notes ?? [])
        setResponses(res.data.responses ?? [])
        setRequestTags(res.data.tags ?? [])
      })
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setLoading(false))

    adminApi.get('/admin/tags')
      .then((res) => setAllTags(res.data.items ?? res.data))
      .catch(() => {})
  }, [id])

  async function handleAddTag() {
    if (!selectedTagId) return
    try {
      await adminApi.post('/admin/requests/add-tag', { request_id: Number(id), tag_id: Number(selectedTagId) })
      const tag = allTags.find(t => t.id === Number(selectedTagId))
      if (tag) setRequestTags(prev => [...prev, tag])
      setSelectedTagId('')
      toast.success('Tag added')
    } catch (err) {
      toast.error(getApiError(err))
    }
  }

  async function handleRemoveTag(tagId: number) {
    try {
      await adminApi.delete('/admin/requests/remove-tag', { data: { request_id: Number(id), tag_id: tagId } })
      setRequestTags(prev => prev.filter(t => t.id !== tagId))
      toast.success('Tag removed')
    } catch (err) {
      toast.error(getApiError(err))
    }
  }

  if (loading) return (
    <div className="max-w-2xl space-y-4">
      <Skeleton className="h-8 w-64 bg-[#07472e]/5" />
      <Skeleton className="h-64 rounded-[32px] bg-[#07472e]/5" />
    </div>
  )

  if (!request) return <p className="text-[#647a6b]">Ticket not found</p>

  const unaddedTags = allTags.filter(t => !requestTags.find(rt => rt.id === t.id))

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-[#647a6b] hover:text-[#07472e]">←</button>
        <h1 className="text-xl font-bold text-[#07472e] flex-1">{request.title}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[request.status] ?? 'bg-gray-50 text-gray-600'}`}>
          {request.status.replace('_', ' ')}
        </span>
      </div>

      {employee && (
        <div className="rounded-2xl bg-white border border-[#07472e]/10 px-5 py-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#07472e] flex items-center justify-center text-sm font-bold text-[#fbfff3]">
            {employee.name?.[0]}
          </div>
          <div>
            <p className="text-sm font-medium text-[#07472e]">{employee.name}</p>
            <p className="text-xs text-[#647a6b]">{employee.email}</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white border border-[#07472e]/10 p-6 space-y-4">
        <p className="text-xs text-[#647a6b]">Submitted {new Date(request.created_at).toLocaleString()}</p>
        {fieldValues.map((fv) => (
          <div key={fv.id}>
            <p className="text-xs text-[#647a6b] mb-1">{fv.field_label}</p>
            <p className="text-[#07472e]">{fv.field_value}</p>
          </div>
        ))}
      </div>

      {/* Tags */}
      <div className="rounded-2xl bg-white border border-[#07472e]/10 p-6">
        <h2 className="font-semibold text-[#07472e] mb-4">Tags</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {requestTags.length === 0 ? (
            <p className="text-sm text-[#647a6b]">No tags assigned</p>
          ) : (
            requestTags.map((t) => (
              <div key={t.id} className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: t.color }}>
                {t.name}
                <button onClick={() => handleRemoveTag(t.id)} className="ml-1 opacity-80 hover:opacity-100">×</button>
              </div>
            ))
          )}
        </div>
        {unaddedTags.length > 0 && (
          <div className="flex gap-2">
            <Select value={selectedTagId} onValueChange={setSelectedTagId}>
              <SelectTrigger className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] h-8 text-xs focus:ring-[#07472e] flex-1">
                <SelectValue placeholder="Select a tag..." />
              </SelectTrigger>
              <SelectContent>
                {unaddedTags.map(t => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleAddTag} disabled={!selectedTagId}
              className="bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] h-8 text-xs">
              Add Tag
            </Button>
          </div>
        )}
      </div>

      {responses.length > 0 && (
        <div className="rounded-2xl bg-white border border-[#07472e]/10 p-6">
          <h2 className="font-semibold text-[#07472e] mb-4">HR Responses</h2>
          <div className="space-y-3">
            {responses.map((r) => (
              <div key={r.id} className="rounded-xl bg-[#07472e]/5 border border-[#07472e]/10 px-4 py-3">
                <p className="text-[#07472e] text-sm">{r.content}</p>
                <p className="text-xs text-[#647a6b] mt-1">{new Date(r.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="rounded-2xl bg-white border border-[#07472e]/10 p-6">
          <h2 className="font-semibold text-[#07472e] mb-4">Internal Notes</h2>
          <div className="space-y-3">
            {notes.map((n) => (
              <div key={n.id} className="rounded-xl bg-[#fbfff3] px-4 py-3">
                <p className="text-[#07472e] text-sm">{n.content}</p>
                <p className="text-xs text-[#647a6b] mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
