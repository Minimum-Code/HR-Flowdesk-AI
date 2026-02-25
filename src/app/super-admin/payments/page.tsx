'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { superAdminApi, getApiError } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface Subscription {
  id: number
  created_at: number
  company_id: number
  plan: string
  status: string
  expires_at: number | null
}

function DotsIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-[#647a6b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

export default function SuperAdminPaymentsPage() {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({ company_id: '', plan: 'starter', status: 'active', expires_at: '' })

  const [editOpen, setEditOpen] = useState(false)
  const [editSub, setEditSub] = useState<Subscription | null>(null)
  const [editForm, setEditForm] = useState({ plan: 'starter', status: 'active', expires_at: '' })
  const [editing, setEditing] = useState(false)

  function load() {
    setLoading(true)
    superAdminApi.get('/super-admin/payments')
      .then((res) => setSubs(res.data.items ?? res.data))
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      await superAdminApi.post('/super-admin/payments', {
        company_id: Number(createForm.company_id),
        plan: createForm.plan,
        status: createForm.status,
        expires_at: createForm.expires_at ? new Date(createForm.expires_at).getTime() : null,
      })
      toast.success('Subscription created!')
      setCreateOpen(false)
      setCreateForm({ company_id: '', plan: 'starter', status: 'active', expires_at: '' })
      load()
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setCreating(false)
    }
  }

  function openEdit(s: Subscription) {
    setEditSub(s)
    setEditForm({
      plan: s.plan,
      status: s.status,
      expires_at: s.expires_at ? new Date(s.expires_at).toISOString().split('T')[0] : '',
    })
    setEditOpen(true)
    setOpenMenu(null)
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editSub) return
    setEditing(true)
    try {
      await superAdminApi.patch('/super-admin/payments/update', {
        subscription_id: editSub.id,
        plan: editForm.plan,
        status: editForm.status,
        expires_at: editForm.expires_at ? new Date(editForm.expires_at).getTime() : null,
      })
      toast.success('Subscription updated!')
      setEditOpen(false)
      load()
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setEditing(false)
    }
  }

  const filteredSubs = subs.filter(s =>
    s.plan.toLowerCase().includes(search.toLowerCase()) ||
    String(s.company_id).includes(search)
  )

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const statusColors: Record<string, string> = {
    active: 'bg-[#07472e]/10 text-[#07472e]',
    trial: 'bg-blue-100 text-blue-700',
    inactive: 'bg-[#647a6b]/10 text-[#647a6b]',
    cancelled: 'bg-red-100 text-red-700',
    expired: 'bg-red-100 text-red-700',
  }

  return (
    <div ref={menuRef} className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-[32px] font-medium text-[#07472e] tracking-[-0.96px] leading-[1.5]">Payments</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <button className="bg-[#c8f481] text-[#07472e] font-medium text-[16px] tracking-[-0.16px] rounded-xl px-6 h-12 hover:bg-[#b8e56e] transition">
              New Subscription
            </button>
          </DialogTrigger>
          <DialogContent className="bg-white border-[#07472e]/10 text-[#07472e]">
            <DialogHeader><DialogTitle className="text-[#07472e]">Create Subscription</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label className="text-[#647a6b]">Company ID</Label>
                <Input required type="number" value={createForm.company_id} onChange={e => setCreateForm(f => ({ ...f, company_id: e.target.value }))}
                  className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e]" placeholder="1" />
              </div>
              <div className="space-y-1">
                <Label className="text-[#647a6b]">Plan</Label>
                <Select value={createForm.plan} onValueChange={v => setCreateForm(f => ({ ...f, plan: v }))}>
                  <SelectTrigger className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] focus:ring-[#07472e]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[#647a6b]">Status</Label>
                <Select value={createForm.status} onValueChange={v => setCreateForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] focus:ring-[#07472e]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[#647a6b]">Expires At (optional)</Label>
                <Input type="date" value={createForm.expires_at} onChange={e => setCreateForm(f => ({ ...f, expires_at: e.target.value }))}
                  className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e]" />
              </div>
              <button type="submit" disabled={creating}
                className="w-full bg-[#07472e] text-[#fbfff3] rounded-xl h-12 font-medium hover:bg-[#05351f] transition disabled:opacity-60">
                {creating ? 'Creating...' : 'Create Subscription'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-1 items-center gap-2 border border-[#07472e] rounded-xl px-4 py-3">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search by plan or company ID"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[16px] text-[#07472e] placeholder:text-[#647a6b] outline-none tracking-[-0.16px]"
          />
        </div>
      </div>

      {/* Payments board */}
      <div className="bg-[rgba(7,71,46,0.06)] rounded-2xl p-4 flex flex-col gap-2 flex-1">
        {/* Column headers */}
        <div className="flex items-center gap-2 px-4 h-10">
          <span className="flex-1 text-[16px] text-[#647a6b] tracking-[-0.16px]">Plan</span>
          <span className="w-36 text-[16px] text-[#647a6b] tracking-[-0.16px]">Created</span>
          <span className="w-32 text-[16px] text-[#647a6b] tracking-[-0.16px]">Company ID</span>
          <span className="w-24 text-[16px] text-[#647a6b] tracking-[-0.16px]">Status</span>
          <span className="w-10" />
        </div>

        {loading ? (
          <div className="space-y-2 px-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl bg-[#07472e]/5" />)}
          </div>
        ) : filteredSubs.length === 0 ? (
          <p className="py-8 text-center text-[#647a6b] text-sm">
            {search ? 'No subscriptions match your search' : 'No subscriptions yet'}
          </p>
        ) : (
          filteredSubs.map((s) => (
            <div key={s.id} className="flex items-center gap-2 px-4 py-3.5 border-b border-[rgba(7,71,46,0.12)] last:border-0">
              <p className="flex-1 text-[16px] font-medium text-[#07472e] tracking-[-0.16px] capitalize">{s.plan}</p>
              <p className="w-36 text-[16px] text-[#647a6b] tracking-[-0.16px]">{formatDate(s.created_at)}</p>
              <p className="w-32 text-[16px] text-[#647a6b] tracking-[-0.16px]">#{s.company_id}</p>
              <div className="w-24">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[s.status] ?? 'bg-[#647a6b]/10 text-[#647a6b]'}`}>
                  {s.status}
                </span>
              </div>
              <div className="w-10 relative">
                <button
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[rgba(7,71,46,0.08)] text-[#647a6b]"
                  onClick={() => setOpenMenu(openMenu === s.id ? null : s.id)}
                >
                  <DotsIcon />
                </button>
                {openMenu === s.id && (
                  <div className="absolute right-0 top-11 z-20 bg-white rounded-2xl shadow-[0px_4px_100px_0px_rgba(7,71,46,0.16)] p-2 w-[160px] border border-[rgba(7,71,46,0.08)]">
                    <button
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-[rgba(7,71,46,0.06)] text-[#07472e] text-[15px] font-medium"
                      onClick={() => openEdit(s)}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-white border-[#07472e]/10 text-[#07472e]">
          <DialogHeader><DialogTitle className="text-[#07472e]">Edit Subscription</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label className="text-[#647a6b]">Plan</Label>
              <Select value={editForm.plan} onValueChange={v => setEditForm(f => ({ ...f, plan: v }))}>
                <SelectTrigger className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] focus:ring-[#07472e]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[#647a6b]">Status</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] focus:ring-[#07472e]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[#647a6b]">Expires At (optional)</Label>
              <Input type="date" value={editForm.expires_at} onChange={e => setEditForm(f => ({ ...f, expires_at: e.target.value }))}
                className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e]" />
            </div>
            <button type="submit" disabled={editing}
              className="w-full bg-[#07472e] text-[#fbfff3] rounded-xl h-12 font-medium hover:bg-[#05351f] transition disabled:opacity-60">
              {editing ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
