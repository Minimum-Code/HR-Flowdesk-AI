import Link from 'next/link'

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#07472e]">Users</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/users/hrs">
          <div className="rounded-[32px] bg-[#ffffff] p-8 hover:bg-[#f0f9f4] transition-colors cursor-pointer">
            <div className="h-12 w-12 rounded-2xl bg-[#07472e]/10 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-[#07472e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p className="text-lg font-semibold text-[#07472e]">HR Managers</p>
            <p className="text-sm text-[#647a6b] mt-1">Manage HR staff accounts</p>
          </div>
        </Link>
        <Link href="/admin/users/employees">
          <div className="rounded-[32px] bg-[#ffffff] p-8 hover:bg-[#f0f9f4] transition-colors cursor-pointer">
            <div className="h-12 w-12 rounded-2xl bg-[#07472e]/10 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-[#07472e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <p className="text-lg font-semibold text-[#07472e]">Employees</p>
            <p className="text-sm text-[#647a6b] mt-1">Manage employee accounts</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
