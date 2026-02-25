'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { adminApi, getApiError } from '@/lib/api'
import { Tag } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const TAG_COLORS = ['#07472e', '#2563eb', '#7c3aed', '#dc2626', '#d97706', '#0891b2']

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', color: TAG_COLORS[0] })
  const [creating, setCreating] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [editTag, setEditTag] = useState<Tag | null>(null)
  const [editForm, setEditForm] = useState({ name: '', color: '' })
  const [editing, setEditing] = useState(false)

  function load() {
    setLoading(true)
    adminApi.get('/admin/tags')
      .then((res) => setTags(res.data.items ?? res.data))
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      await adminApi.post('/admin/tags', createForm)
      toast.success(`Tag "${createForm.name}" created!`)
      setCreateOpen(false)
      setCreateForm({ name: '', color: TAG_COLORS[0] })
      load()
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setCreating(false)
    }
  }

  function openEdit(t: Tag) {
    setEditTag(t)
    setEditForm({ name: t.name, color: t.color })
    setEditOpen(true)
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editTag) return
    setEditing(true)
    try {
      await adminApi.patch('/admin/tags/update', { tag_id: editTag.id, name: editForm.name, color: editForm.color })
      toast.success('Tag updated!')
      setEditOpen(false)
      load()
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setEditing(false)
    }
  }

  async function handleDelete(tagId: number, tagName: string) {
    if (!confirm(`Delete tag "${tagName}"?`)) return
    try {
      await adminApi.delete('/admin/tags/delete', { data: { tag_id: tagId } })
      toast.success('Tag deleted')
      load()
    } catch (err) {
      toast.error(getApiError(err))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#07472e]">Tags</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] font-semibold">+ New Tag</Button>
          </DialogTrigger>
          <DialogContent className="bg-[#ffffff] border-[#07472e]/10 text-[#07472e]">
            <DialogHeader><DialogTitle className="text-[#07472e]">Create Tag</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label className="text-[#647a6b]">Name</Label>
                <Input required value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] placeholder:text-[#647a6b]"
                  placeholder="e.g. Urgent" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#647a6b]">Color</Label>
                <div className="flex gap-2">
                  {TAG_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setCreateForm(f => ({ ...f, color: c }))}
                      className={`h-7 w-7 rounded-full border-2 transition-all ${createForm.color === c ? 'border-[#07472e] scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <Button type="submit" disabled={creating} className="w-full bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] font-semibold">
                {creating ? 'Creating...' : 'Create Tag'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-[32px] bg-[#ffffff] p-6">
        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-2xl bg-[#07472e]/5" />)}</div>
        ) : tags.length === 0 ? (
          <p className="py-10 text-center text-[#647a6b]">No tags yet. Create your first tag!</p>
        ) : (
          <div className="space-y-2">
            {tags.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-2xl bg-[#fbfff3] px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: t.color }} />
                  <p className="font-medium text-[#07472e]">{t.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="border-[#07472e]/20 text-[#07472e] hover:bg-[#07472e]/5 h-7 text-xs" onClick={() => openEdit(t)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 h-7 text-xs" onClick={() => handleDelete(t.id, t.name)}>
                    Delete
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
          <DialogHeader><DialogTitle className="text-[#07472e]">Edit Tag</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label className="text-[#647a6b]">Name</Label>
              <Input required value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#647a6b]">Color</Label>
              <div className="flex gap-2">
                {TAG_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setEditForm(f => ({ ...f, color: c }))}
                    className={`h-7 w-7 rounded-full border-2 transition-all ${editForm.color === c ? 'border-[#07472e] scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <Button type="submit" disabled={editing} className="w-full bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] font-semibold">
              {editing ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
