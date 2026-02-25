import { redirect } from 'next/navigation'

export default function SuperAdminDashboard() {
  redirect('/super-admin/users')
}
