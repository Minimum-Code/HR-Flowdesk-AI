'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { adminApi, getApiError } from '@/lib/api'
import { Category } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const PRIORITY_COLOR: Record<string, string> = {
  low: 'bg-[#07472e]/5 text-[#647a6b]',
  medium: 'bg-yellow-50 text-yellow-700',
  high: 'bg-orange-500/20 text-orange-400',
  urgent: 'bg-red-50 text-red-700',
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', priority: 'medium' })

  function load() {
    setLoading(true)
    adminApi.get('/admin/categories')
      .then((res) => setCategories(res.data.items ?? res.data))
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await adminApi.post('/admin/categories', form)
      toast.success(`Category "${form.name}" created!`)
      setOpen(false)
      setForm({ name: '', description: '', priority: 'medium' })
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
        <h1 className="text-2xl font-bold text-[#07472e]">Request Categories</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] font-semibold">+ New Category</Button>
          </DialogTrigger>
          <DialogContent className="bg-[#ffffff] border-[#07472e]/10 text-[#07472e]">
            <DialogHeader><DialogTitle className="text-[#07472e]">New Category</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label className="text-[#647a6b]">Name</Label>
                <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] placeholder:text-[#647a6b]" placeholder="e.g. Leave Request" />
              </div>
              <div className="space-y-1">
                <Label className="text-[#647a6b]">Description</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] placeholder:text-[#647a6b]" placeholder="Optional" />
              </div>
              <div className="space-y-1">
                <Label className="text-[#647a6b]">Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] focus:ring-[#07472e]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] font-semibold">
                {submitting ? 'Creating...' : 'Create Category'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-[32px] bg-[#ffffff] p-6">
        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl bg-[#07472e]/5" />)}</div>
        ) : categories.length === 0 ? (
          <p className="py-10 text-center text-[#647a6b]">No categories yet</p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/admin/categories/${cat.id}`}>
                <div className="flex items-center justify-between rounded-2xl bg-[#fbfff3] px-5 py-4 hover:bg-[#07472e]/5 transition-colors">
                  <div>
                    <p className="font-medium text-[#07472e]">{cat.name}</p>
                    <p className="text-xs text-[#647a6b] mt-0.5">{cat.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLOR[cat.priority]}`}>
                      {cat.priority}
                    </span>
                    <Badge className={cat.is_active ? 'bg-green-50 text-[#07472e]' : 'bg-red-50 text-red-700'}>
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
