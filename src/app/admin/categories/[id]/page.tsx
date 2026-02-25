'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { adminApi, getApiError } from '@/lib/api'
import { Category, FormField, User, ResponseTemplate } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function AdminCategoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [fields, setFields] = useState<FormField[]>([])
  const [assignedHrs, setAssignedHrs] = useState<User[]>([])
  const [availableHrs, setAvailableHrs] = useState<User[]>([])
  const [templates, setTemplates] = useState<ResponseTemplate[]>([])
  const [loading, setLoading] = useState(true)

  // Add field dialog
  const [fieldOpen, setFieldOpen] = useState(false)
  const [fieldSubmitting, setFieldSubmitting] = useState(false)
  const [fieldForm, setFieldForm] = useState({ label: '', field_type: 'text', required: true })

  // Edit field dialog
  const [editFieldOpen, setEditFieldOpen] = useState(false)
  const [editField, setEditField] = useState<FormField | null>(null)
  const [editFieldForm, setEditFieldForm] = useState({ label: '', field_type: 'text', required: true })
  const [editFieldSubmitting, setEditFieldSubmitting] = useState(false)

  // Assign HR dialog
  const [hrOpen, setHrOpen] = useState(false)
  const [hrSubmitting, setHrSubmitting] = useState(false)
  const [selectedHrId, setSelectedHrId] = useState('')

  // Response templates
  const [templateOpen, setTemplateOpen] = useState(false)
  const [templateSubmitting, setTemplateSubmitting] = useState(false)
  const [templateForm, setTemplateForm] = useState({ title: '', content: '' })
  const [editTemplateOpen, setEditTemplateOpen] = useState(false)
  const [editTemplate, setEditTemplate] = useState<ResponseTemplate | null>(null)
  const [editTemplateForm, setEditTemplateForm] = useState({ title: '', content: '' })
  const [editTemplateSubmitting, setEditTemplateSubmitting] = useState(false)

  function load() {
    adminApi.get('/admin/categories/detail', { params: { category_id: Number(id) } })
      .then((res) => {
        setCategory(res.data.category)
        setFields(res.data.fields ?? [])
        setAssignedHrs(res.data.assigned_hrs ?? [])
      })
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setLoading(false))
  }

  function loadTemplates() {
    adminApi.get('/admin/response-templates', { params: { category_id: Number(id) } })
      .then((res) => setTemplates(res.data.items ?? res.data))
      .catch(() => {})
  }

  useEffect(() => {
    load()
    loadTemplates()
    adminApi.get('/admin/users/hrs')
      .then((res) => setAvailableHrs(res.data.items ?? res.data))
      .catch(() => {})
  }, [id])

  async function handleAddField(e: React.FormEvent) {
    e.preventDefault()
    setFieldSubmitting(true)
    try {
      await adminApi.post('/admin/categories/fields', {
        category_id: Number(id),
        label: fieldForm.label,
        field_type: fieldForm.field_type,
        required: fieldForm.required,
        sort_order: fields.length,
      })
      toast.success('Field added!')
      setFieldOpen(false)
      setFieldForm({ label: '', field_type: 'text', required: true })
      load()
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setFieldSubmitting(false)
    }
  }

  function openEditField(f: FormField) {
    setEditField(f)
    setEditFieldForm({ label: f.label, field_type: f.field_type, required: f.required })
    setEditFieldOpen(true)
  }

  async function handleUpdateField(e: React.FormEvent) {
    e.preventDefault()
    if (!editField) return
    setEditFieldSubmitting(true)
    try {
      await adminApi.patch('/admin/form-fields/update', {
        field_id: editField.id,
        label: editFieldForm.label,
        field_type: editFieldForm.field_type,
        required: editFieldForm.required,
      })
      toast.success('Field updated!')
      setEditFieldOpen(false)
      load()
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setEditFieldSubmitting(false)
    }
  }

  async function handleDeleteField(fieldId: number) {
    if (!confirm('Deactivate this field?')) return
    try {
      await adminApi.delete('/admin/form-fields/delete', { data: { field_id: fieldId } })
      toast.success('Field deactivated')
      load()
    } catch (err) {
      toast.error(getApiError(err))
    }
  }

  async function handleAssignHr(e: React.FormEvent) {
    e.preventDefault()
    setHrSubmitting(true)
    try {
      await adminApi.post('/admin/categories/assign-hr', {
        category_id: Number(id),
        hr_id: Number(selectedHrId),
      })
      toast.success('HR assigned!')
      setHrOpen(false)
      setSelectedHrId('')
      load()
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setHrSubmitting(false)
    }
  }

  async function handleUnassignHr(hrId: number) {
    if (!confirm('Remove this HR from category?')) return
    try {
      await adminApi.delete('/admin/categories/unassign-hr', { data: { category_id: Number(id), hr_id: hrId } })
      toast.success('HR removed')
      load()
    } catch (err) {
      toast.error(getApiError(err))
    }
  }

  async function handleAddTemplate(e: React.FormEvent) {
    e.preventDefault()
    setTemplateSubmitting(true)
    try {
      await adminApi.post('/admin/response-templates', {
        category_id: Number(id),
        title: templateForm.title,
        content: templateForm.content,
      })
      toast.success('Template added!')
      setTemplateOpen(false)
      setTemplateForm({ title: '', content: '' })
      loadTemplates()
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setTemplateSubmitting(false)
    }
  }

  function openEditTemplate(t: ResponseTemplate) {
    setEditTemplate(t)
    setEditTemplateForm({ title: t.title, content: t.content })
    setEditTemplateOpen(true)
  }

  async function handleUpdateTemplate(e: React.FormEvent) {
    e.preventDefault()
    if (!editTemplate) return
    setEditTemplateSubmitting(true)
    try {
      await adminApi.patch('/admin/response-templates/update', {
        template_id: editTemplate.id,
        title: editTemplateForm.title,
        content: editTemplateForm.content,
      })
      toast.success('Template updated!')
      setEditTemplateOpen(false)
      loadTemplates()
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setEditTemplateSubmitting(false)
    }
  }

  async function handleDeleteTemplate(templateId: number) {
    if (!confirm('Delete this template?')) return
    try {
      await adminApi.delete('/admin/response-templates/delete', { data: { template_id: templateId } })
      toast.success('Template deleted')
      loadTemplates()
    } catch (err) {
      toast.error(getApiError(err))
    }
  }

  if (loading) return (
    <div className="max-w-2xl space-y-4">
      <Skeleton className="h-8 w-64 bg-[#07472e]/5" />
      <Skeleton className="h-48 rounded-[32px] bg-[#07472e]/5" />
    </div>
  )

  if (!category) return <p className="text-[#647a6b]">Category not found</p>

  const unassignedHrs = availableHrs.filter(hr => !assignedHrs.find(a => a.id === hr.id))

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-[#647a6b] hover:text-[#07472e] text-lg">←</button>
        <h1 className="text-xl font-bold text-[#07472e]">{category.name}</h1>
        <Badge className={category.is_active ? 'bg-green-50 text-[#07472e]' : 'bg-red-50 text-red-700'}>
          {category.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="rounded-[32px] bg-[#ffffff] p-6">
        <p className="text-[#647a6b]">{category.description}</p>
        <p className="text-xs text-[#647a6b] mt-2">Priority: <span className="text-[#647a6b]">{category.priority}</span></p>
      </div>

      {/* Form Fields */}
      <div className="rounded-[32px] bg-[#ffffff] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#07472e]">Form Fields ({fields.length})</h2>
          <Dialog open={fieldOpen} onOpenChange={setFieldOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] font-semibold">+ Add Field</Button>
            </DialogTrigger>
            <DialogContent className="bg-[#ffffff] border-[#07472e]/10 text-[#07472e]">
              <DialogHeader><DialogTitle className="text-[#07472e]">Add Form Field</DialogTitle></DialogHeader>
              <form onSubmit={handleAddField} className="space-y-4 mt-2">
                <div className="space-y-1">
                  <Label className="text-[#647a6b]">Label</Label>
                  <Input required value={fieldForm.label}
                    onChange={e => setFieldForm(f => ({ ...f, label: e.target.value }))}
                    className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] placeholder:text-[#647a6b]"
                    placeholder="e.g. Start Date" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[#647a6b]">Field Type</Label>
                  <Select value={fieldForm.field_type} onValueChange={v => setFieldForm(f => ({ ...f, field_type: v }))}>
                    <SelectTrigger className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] focus:ring-[#07472e]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="required" checked={fieldForm.required}
                    onChange={e => setFieldForm(f => ({ ...f, required: e.target.checked }))}
                    className="h-4 w-4 accent-[#07472e]" />
                  <Label htmlFor="required" className="text-[#647a6b]">Required field</Label>
                </div>
                <Button type="submit" disabled={fieldSubmitting} className="w-full bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] font-semibold">
                  {fieldSubmitting ? 'Adding...' : 'Add Field'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {fields.length === 0 ? (
          <p className="text-[#647a6b] text-sm">No fields configured</p>
        ) : (
          <div className="space-y-2">
            {fields.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-2xl bg-[#fbfff3] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[#07472e]">{f.label}</p>
                  <p className="text-xs text-[#647a6b]">{f.field_type}{f.required ? ' · Required' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="border-[#07472e]/20 text-[#07472e] hover:bg-[#07472e]/5 h-7 text-xs" onClick={() => openEditField(f)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 h-7 text-xs" onClick={() => handleDeleteField(f.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assigned HRs */}
      <div className="rounded-[32px] bg-[#ffffff] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#07472e]">Assigned HRs ({assignedHrs.length})</h2>
          {unassignedHrs.length > 0 && (
            <Dialog open={hrOpen} onOpenChange={setHrOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] font-semibold">+ Assign HR</Button>
              </DialogTrigger>
              <DialogContent className="bg-[#ffffff] border-[#07472e]/10 text-[#07472e]">
                <DialogHeader><DialogTitle className="text-[#07472e]">Assign HR Manager</DialogTitle></DialogHeader>
                <form onSubmit={handleAssignHr} className="space-y-4 mt-2">
                  <div className="space-y-1">
                    <Label className="text-[#647a6b]">HR Manager</Label>
                    <Select value={selectedHrId} onValueChange={setSelectedHrId}>
                      <SelectTrigger className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] focus:ring-[#07472e]">
                        <SelectValue placeholder="Select HR manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {unassignedHrs.map(hr => (
                          <SelectItem key={hr.id} value={String(hr.id)}>{hr.name} ({hr.email})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={hrSubmitting || !selectedHrId}
                    className="w-full bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] font-semibold">
                    {hrSubmitting ? 'Assigning...' : 'Assign HR'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        {assignedHrs.length === 0 ? (
          <p className="text-[#647a6b] text-sm">No HRs assigned</p>
        ) : (
          <div className="space-y-2">
            {assignedHrs.map((hr) => (
              <div key={hr.id} className="flex items-center justify-between rounded-2xl bg-[#fbfff3] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#07472e] flex items-center justify-center text-sm font-bold text-[#fbfff3]">
                    {hr.name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#07472e]">{hr.name}</p>
                    <p className="text-xs text-[#647a6b]">{hr.email}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 h-7 text-xs" onClick={() => handleUnassignHr(hr.id)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Templates */}
      <div className="rounded-[32px] bg-[#ffffff] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#07472e]">Response Templates ({templates.length})</h2>
          <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] font-semibold">+ Add Template</Button>
            </DialogTrigger>
            <DialogContent className="bg-[#ffffff] border-[#07472e]/10 text-[#07472e]">
              <DialogHeader><DialogTitle className="text-[#07472e]">Add Response Template</DialogTitle></DialogHeader>
              <form onSubmit={handleAddTemplate} className="space-y-4 mt-2">
                <div className="space-y-1">
                  <Label className="text-[#647a6b]">Title</Label>
                  <Input required value={templateForm.title} onChange={e => setTemplateForm(f => ({ ...f, title: e.target.value }))}
                    className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] placeholder:text-[#647a6b]"
                    placeholder="e.g. Approved - Leave Request" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[#647a6b]">Content</Label>
                  <Textarea required value={templateForm.content} onChange={e => setTemplateForm(f => ({ ...f, content: e.target.value }))}
                    className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] placeholder:text-[#647a6b] focus-visible:ring-[#07472e]"
                    rows={4} placeholder="Template text..." />
                </div>
                <Button type="submit" disabled={templateSubmitting} className="w-full bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] font-semibold">
                  {templateSubmitting ? 'Adding...' : 'Add Template'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {templates.length === 0 ? (
          <p className="text-[#647a6b] text-sm">No templates yet</p>
        ) : (
          <div className="space-y-2">
            {templates.map((t) => (
              <div key={t.id} className="rounded-2xl bg-[#fbfff3] px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#07472e]">{t.title}</p>
                    <p className="text-xs text-[#647a6b] mt-1 line-clamp-2">{t.content}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="border-[#07472e]/20 text-[#07472e] hover:bg-[#07472e]/5 h-7 text-xs" onClick={() => openEditTemplate(t)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 h-7 text-xs" onClick={() => handleDeleteTemplate(t.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit field dialog */}
      <Dialog open={editFieldOpen} onOpenChange={setEditFieldOpen}>
        <DialogContent className="bg-[#ffffff] border-[#07472e]/10 text-[#07472e]">
          <DialogHeader><DialogTitle className="text-[#07472e]">Edit Form Field</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdateField} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label className="text-[#647a6b]">Label</Label>
              <Input required value={editFieldForm.label} onChange={e => setEditFieldForm(f => ({ ...f, label: e.target.value }))}
                className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e]" />
            </div>
            <div className="space-y-1">
              <Label className="text-[#647a6b]">Field Type</Label>
              <Select value={editFieldForm.field_type} onValueChange={v => setEditFieldForm(f => ({ ...f, field_type: v }))}>
                <SelectTrigger className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] focus:ring-[#07472e]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="edit-required" checked={editFieldForm.required}
                onChange={e => setEditFieldForm(f => ({ ...f, required: e.target.checked }))}
                className="h-4 w-4 accent-[#07472e]" />
              <Label htmlFor="edit-required" className="text-[#647a6b]">Required field</Label>
            </div>
            <Button type="submit" disabled={editFieldSubmitting} className="w-full bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] font-semibold">
              {editFieldSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit template dialog */}
      <Dialog open={editTemplateOpen} onOpenChange={setEditTemplateOpen}>
        <DialogContent className="bg-[#ffffff] border-[#07472e]/10 text-[#07472e]">
          <DialogHeader><DialogTitle className="text-[#07472e]">Edit Template</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdateTemplate} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label className="text-[#647a6b]">Title</Label>
              <Input required value={editTemplateForm.title} onChange={e => setEditTemplateForm(f => ({ ...f, title: e.target.value }))}
                className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e]" />
            </div>
            <div className="space-y-1">
              <Label className="text-[#647a6b]">Content</Label>
              <Textarea required value={editTemplateForm.content} onChange={e => setEditTemplateForm(f => ({ ...f, content: e.target.value }))}
                className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] focus-visible:ring-[#07472e]" rows={4} />
            </div>
            <Button type="submit" disabled={editTemplateSubmitting} className="w-full bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] font-semibold">
              {editTemplateSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
