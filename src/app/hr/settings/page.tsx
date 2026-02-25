'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { hrApi, getApiError } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function HRSettingsPage() {
  const { user, fetchMe } = useAuthStore()
  const [name, setName] = useState(user?.name ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await hrApi.patch('/hr/profile', { name })
      await fetchMe()
      toast.success('Profile updated')
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-[#07472e]">Settings</h1>
      <div className="rounded-[32px] bg-[#ffffff] p-8">
        <h2 className="text-lg font-semibold text-[#07472e] mb-6">Profile</h2>
        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-[#647a6b]">Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] focus-visible:ring-[#07472e]" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#647a6b]">Email</Label>
            <Input value={user?.email ?? ''} disabled className="border-[#07472e]/20 bg-[#fbfff3] text-[#647a6b] cursor-not-allowed" />
          </div>
          <Button type="submit" disabled={saving} className="bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f] font-semibold">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  )
}
