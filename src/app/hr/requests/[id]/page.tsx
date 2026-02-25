'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { hrApi, getApiError } from '@/lib/api'
import { Request, RequestFieldValue, Note, HrResponse, User, ResponseTemplate } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  in_progress: 'bg-blue-50 text-blue-700',
  resolved: 'bg-green-50 text-[#07472e]',
  cancelled: 'bg-red-50 text-red-700',
}

export default function HRRequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [request, setRequest] = useState<Request | null>(null)
  const [employee, setEmployee] = useState<User | null>(null)
  const [fieldValues, setFieldValues] = useState<RequestFieldValue[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [responses, setResponses] = useState<HrResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [responseText, setResponseText] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [savingResponse, setSavingResponse] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [templates, setTemplates] = useState<ResponseTemplate[]>([])

  async function load() {
    try {
      const res = await hrApi.get('/hr/requests/detail', { params: { request_id: Number(id) } })
      setRequest(res.data.request)
      setEmployee(res.data.employee)
      setFieldValues(res.data.field_values ?? [])
      setNotes(res.data.notes ?? [])
      setResponses(res.data.responses ?? [])
      // load templates for this category
      if (res.data.request?.category_id) {
        hrApi.get('/hr/response-templates', { params: { category_id: res.data.request.category_id } })
          .then((tr) => setTemplates(tr.data.items ?? tr.data))
          .catch(() => {})
      }
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function handleStatusChange(status: string) {
    setUpdatingStatus(true)
    try {
      await hrApi.patch('/hr/requests/update', { request_id: Number(id), status })
      setRequest((prev) => prev ? { ...prev, status: status as Request['status'] } : prev)
      toast.success('Status updated')
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault()
    if (!newNote.trim()) return
    setSavingNote(true)
    try {
      const res = await hrApi.post('/hr/requests/notes', { request_id: Number(id), content: newNote })
      setNotes((prev) => [...prev, res.data])
      setNewNote('')
      toast.success('Note added')
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setSavingNote(false)
    }
  }

  async function handleSendResponse(e: React.FormEvent) {
    e.preventDefault()
    if (!responseText.trim()) return
    setSavingResponse(true)
    try {
      const res = await hrApi.post('/hr/requests/response', { request_id: Number(id), content: responseText })
      setResponses((prev) => [res.data, ...prev])
      setResponseText('')
      toast.success('Response sent')
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setSavingResponse(false)
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

      {employee && (
        <Link href={`/hr/employee/profile?user_id=${employee.id}`}>
          <div className="rounded-2xl bg-[#ffffff] px-5 py-3 flex items-center gap-3 hover:bg-[#f0f9f4] transition-colors cursor-pointer">
            <div className="h-8 w-8 rounded-full bg-[#07472e] flex items-center justify-center text-sm font-bold text-[#fbfff3]">
              {employee.name?.[0]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#07472e]">{employee.name}</p>
              <p className="text-xs text-[#647a6b]">{employee.email}</p>
            </div>
            <span className="text-xs text-[#647a6b]">View profile →</span>
          </div>
        </Link>
      )}

      <div className="rounded-[32px] bg-[#ffffff] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#647a6b]">Submitted {new Date(request.created_at).toLocaleString()}</p>
          <Select value={request.status} onValueChange={handleStatusChange} disabled={updatingStatus}>
            <SelectTrigger className="w-36 border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] h-8 text-xs focus:ring-[#07472e]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {fieldValues.map((fv) => (
          <div key={fv.id}>
            <p className="text-xs text-[#647a6b] mb-1">{fv.field_label}</p>
            <p className="text-[#07472e]">{fv.field_value}</p>
          </div>
        ))}
      </div>

      {/* Internal Notes */}
      <div className="rounded-[32px] bg-[#ffffff] p-6">
        <h2 className="font-semibold text-[#07472e] mb-4">Internal Notes</h2>
        <div className="space-y-3 mb-4">
          {notes.map((n) => (
            <div key={n.id} className="rounded-2xl bg-[#fbfff3] px-4 py-3">
              <p className="text-[#07472e] text-sm">{n.content}</p>
              <p className="text-xs text-[#647a6b] mt-1">{new Date(n.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddNote} className="flex gap-2">
          <Textarea
            placeholder="Add a note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={2}
            className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] placeholder:text-[#647a6b] focus-visible:ring-[#07472e]"
          />
          <Button type="submit" disabled={savingNote} className="shrink-0 bg-[#07472e]/5 text-[#07472e] hover:bg-white/20">
            Add
          </Button>
        </form>
      </div>

      {/* Response */}
      <div className="rounded-[32px] bg-[#ffffff] p-6">
        <h2 className="font-semibold text-[#07472e] mb-4">Response to Employee</h2>
        {templates.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-[#647a6b] mb-2">Templates</p>
            <div className="flex flex-wrap gap-2">
              {templates.map((t) => (
                <button key={t.id} type="button" onClick={() => setResponseText(t.content)}
                  className="rounded-full px-3 py-1 text-xs bg-[#07472e]/10 text-[#07472e] hover:bg-[#07472e]/20 transition-colors">
                  {t.title}
                </button>
              ))}
            </div>
          </div>
        )}
        {responses.map((r) => (
          <div key={r.id} className="mb-3 rounded-2xl bg-[#07472e]/10 border border-[#07472e]/20 px-4 py-3">
            <p className="text-[#07472e] text-sm">{r.content}</p>
            <p className="text-xs text-[#647a6b] mt-1">{new Date(r.created_at).toLocaleString()}</p>
          </div>
        ))}
        <form onSubmit={handleSendResponse} className="flex gap-2">
          <Textarea
            placeholder="Write response to employee..."
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            rows={3}
            className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] placeholder:text-[#647a6b] focus-visible:ring-[#07472e]"
          />
          <Button type="submit" disabled={savingResponse} className="shrink-0 bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f]">
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}
