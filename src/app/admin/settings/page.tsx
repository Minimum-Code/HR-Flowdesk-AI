'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { adminApi, getApiError } from '@/lib/api'
import { Company } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

interface Subscription {
  id: number
  plan: string
  status: string
  expires_at: number | null
}

export default function AdminSettingsPage() {
  const [company, setCompany] = useState<Company | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [subLoading, setSubLoading] = useState(true)

  useEffect(() => {
    adminApi.get('/admin/settings/subscription')
      .then((res) => setSubscription(res.data))
      .catch(() => setSubscription(null))
      .finally(() => setSubLoading(false))
    adminApi.get('/admin/settings/company')
      .then((res) => {
        const c: Company = res.data
        setCompany(c)
        setName(c.name)
        setDescription(c.description ?? '')
      })
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await adminApi.patch('/admin/settings/company/update', { name, description })
      toast.success('Company info updated')
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-[#07472e]">Settings</h1>
      <div className="rounded-[32px] bg-[#ffffff] p-8">
        <h2 className="text-lg font-semibold text-[#07472e] mb-6">Company Information</h2>
        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 rounded-xl bg-[#07472e]/5" />)}</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[#647a6b]">Company Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] focus-visible:ring-[#07472e]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#647a6b]">Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] focus-visible:ring-[#07472e]" />
            </div>
            <Button type="submit" disabled={saving} className="bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] font-semibold">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        )}
      </div>

      <div className="rounded-[32px] bg-[#ffffff] p-8">
        <h2 className="text-lg font-semibold text-[#07472e] mb-6">Subscription</h2>
        {subLoading ? (
          <Skeleton className="h-16 rounded-2xl bg-[#07472e]/5" />
        ) : subscription ? (
          <div className="rounded-2xl bg-[#fbfff3] px-5 py-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-[#07472e] capitalize">{subscription.plan} Plan</p>
              {subscription.expires_at ? (
                <p className="text-xs text-[#647a6b] mt-1">Expires {new Date(subscription.expires_at).toLocaleDateString()}</p>
              ) : (
                <p className="text-xs text-[#647a6b] mt-1">No expiry date</p>
              )}
            </div>
            <Badge className={subscription.status === 'active' ? 'bg-green-50 text-[#07472e]' : 'bg-red-50 text-red-700'}>
              {subscription.status}
            </Badge>
          </div>
        ) : (
          <p className="text-[#647a6b] text-sm">No active subscription</p>
        )}
      </div>
    </div>
  )
}
