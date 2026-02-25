'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { adminApi, getApiError } from '@/lib/api'
import { User } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function AdminHRsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [editOpen, setEditOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ name: '', is_active: true })
  const [editSubmitting, setEditSubmitting] = useState(false)

  function load() {
    setLoading(true)
    adminApi.get('/admin/users/hrs')
      .then((res) => setUsers(res.data.items ?? res.data))
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openEdit(u: User) {
    setEditUser(u)
    setEditForm({ name: u.name, is_active: u.is_active })
    setEditOpen(true)
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editUser) return
    setEditSubmitting(true)
    try {
      await adminApi.patch('/admin/users/update', { user_id: editUser.id, name: editForm.name, is_active: editForm.is_active })
      toast.success('User updated')
      setEditOpen(false)
      load()
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setEditSubmitting(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await adminApi.post('/admin/users', { ...form, role: 'hr' })
      toast.success(`HR Manager "${form.name}" created!`)
      setOpen(false)
      setForm({ name: '', email: '', password: '' })
      load()
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#07472e]">HR Managers</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] font-semibold">+ Add HR</Button>
          </DialogTrigger>
          <DialogContent className="bg-[#ffffff] border-[#07472e]/10 text-[#07472e]">
            <DialogHeader><DialogTitle className="text-[#07472e]">Add HR Manager</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label className="text-[#647a6b]">Full Name</Label>
                <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] placeholder:text-[#647a6b]" placeholder="Jane HR" />
              </div>
              <div className="space-y-1">
                <Label className="text-[#647a6b]">Email</Label>
                <Input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] placeholder:text-[#647a6b]" placeholder="hr@acme.com" />
              </div>
              <div className="space-y-1">
                <Label className="text-[#647a6b]">Password</Label>
                <Input required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] placeholder:text-[#647a6b]" placeholder="••••••••" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] font-semibold">
                {submitting ? 'Creating...' : 'Create HR Manager'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-[32px] bg-[#ffffff] p-6">
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl bg-[#07472e]/5" />)}</div>
        ) : users.length === 0 ? (
          <p className="py-10 text-center text-[#647a6b]">No HR users found</p>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-2xl bg-[#fbfff3] px-5 py-3">
                <div>
                  <p className="font-medium text-[#07472e]">{u.name}</p>
                  <p className="text-xs text-[#647a6b]">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={u.is_active ? 'bg-green-50 text-[#07472e]' : 'bg-red-50 text-red-700'}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button size="sm" variant="outline" className="border-[#07472e]/20 text-[#07472e] hover:bg-[#07472e]/5 h-7 text-xs" onClick={() => openEdit(u)}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-[#ffffff] border-[#07472e]/10 text-[#07472e]">
          <DialogHeader><DialogTitle className="text-[#07472e]">Edit HR Manager</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label className="text-[#647a6b]">Full Name</Label>
              <Input required value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e]" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="edit-active" checked={editForm.is_active}
                onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))}
                className="h-4 w-4 accent-[#07472e]" />
              <Label htmlFor="edit-active" className="text-[#647a6b]">Active</Label>
            </div>
            <Button type="submit" disabled={editSubmitting} className="w-full bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] font-semibold">
              {editSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
