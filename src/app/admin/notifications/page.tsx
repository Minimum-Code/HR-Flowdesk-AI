'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { adminApi, getApiError } from '@/lib/api'
import { Notification } from '@/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const res = await adminApi.get('/admin/notifications', { params: { page: 1, per_page: 50 } })
      setNotifications(res.data.items ?? res.data)
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  async function markAllRead() {
    try {
      await adminApi.patch('/admin/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      toast.success('All notifications marked as read')
    } catch (err) {
      toast.error(getApiError(err))
    }
  }

  useEffect(() => { load() }, [])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#07472e]">Notifications</h1>
          {unreadCount > 0 && <p className="text-[#647a6b] mt-1">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" className="border-[#07472e]/20 text-[#07472e] hover:bg-[#07472e]/5" onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </div>

      <div className="rounded-[32px] bg-[#ffffff] p-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl bg-[#07472e]/5" />)}
          </div>
        ) : notifications.length === 0 ? (
          <p className="py-10 text-center text-[#647a6b]">No notifications</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-2xl px-5 py-4 ${n.is_read ? 'bg-[#fbfff3]' : 'bg-[#07472e]/10 border border-[#07472e]/20'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#07472e]">{n.title}</p>
                    <p className="text-sm text-[#647a6b] mt-1">{n.message}</p>
                    <p className="text-xs text-[#647a6b] mt-2">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  {!n.is_read && <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#07472e]" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
