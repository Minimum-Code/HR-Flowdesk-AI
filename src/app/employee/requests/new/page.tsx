'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { employeeApi, getApiError } from '@/lib/api'
import { Category, FormField } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

export default function NewRequestPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [fields, setFields] = useState<FormField[]>([])
  const [fieldValues, setFieldValues] = useState<Record<number, string>>({})
  const [title, setTitle] = useState('')
  const [loadingCats, setLoadingCats] = useState(true)
  const [loadingFields, setLoadingFields] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    employeeApi.get('/employee/categories')
      .then((res) => setCategories(res.data.items ?? res.data))
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setLoadingCats(false))
  }, [])

  async function onCategoryChange(catId: string) {
    setSelectedCategory(catId)
    setFields([])
    setFieldValues({})
    setLoadingFields(true)
    try {
      const res = await employeeApi.get('/employee/categories/fields', {
        params: { category_id: Number(catId) },
      })
      setFields(res.data.fields ?? [])
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setLoadingFields(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCategory) return toast.error('Please select a category')
    setSubmitting(true)
    try {
      const fv = Object.entries(fieldValues).map(([fieldId, value]) => {
        const field = fields.find((f) => f.id === Number(fieldId))
        return { form_field_id: Number(fieldId), field_label: field?.label ?? '', field_value: value }
      })
      await employeeApi.post('/employee/requests', {
        category_id: Number(selectedCategory),
        title,
        field_values: fv,
      })
      toast.success('Request submitted!')
      router.push('/employee/requests')
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#07472e]">New Request</h1>
        <p className="text-[#647a6b] mt-1">Fill out the form to submit your HR request</p>
      </div>

      <div className="rounded-[32px] bg-[#ffffff] p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[#647a6b]">Category</Label>
            {loadingCats ? (
              <Skeleton className="h-10 w-full rounded-xl bg-[#07472e]/5" />
            ) : (
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] focus:ring-[#07472e]">
                  <SelectValue placeholder="Select a category..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedCategory && (
            <div className="space-y-2">
              <Label className="text-[#647a6b]">Request Title</Label>
              <Input
                placeholder="Brief description of your request"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] placeholder:text-[#647a6b] focus-visible:ring-[#07472e]"
              />
            </div>
          )}

          {loadingFields && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl bg-[#07472e]/5" />)}
            </div>
          )}

          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label className="text-[#647a6b]">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </Label>
              {field.field_type === 'textarea' ? (
                <Textarea
                  required={field.required}
                  value={fieldValues[field.id] ?? ''}
                  onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] placeholder:text-[#647a6b] focus-visible:ring-[#07472e]"
                />
              ) : field.field_type === 'select' ? (
                <Select
                  value={fieldValues[field.id] ?? ''}
                  onValueChange={(v) => setFieldValues((prev) => ({ ...prev, [field.id]: v }))}
                >
                  <SelectTrigger className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] focus:ring-[#07472e]">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options ?? []).map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={field.field_type === 'date' ? 'date' : field.field_type === 'number' ? 'number' : 'text'}
                  required={field.required}
                  value={fieldValues[field.id] ?? ''}
                  onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] placeholder:text-[#647a6b] focus-visible:ring-[#07472e]"
                />
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="border-[#07472e]/20 text-[#07472e] hover:bg-[#07472e]/5" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !selectedCategory || !title}
              className="bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] font-semibold"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
