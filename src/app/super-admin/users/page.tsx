'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { superAdminApi, getApiError } from '@/lib/api'
import { Company, User } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

function DotsIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-[#647a6b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

export default function SuperAdminUsersPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Create company dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    company_name: '', company_description: '',
    admin_name: '', admin_email: '', admin_password: '',
  })

  // Edit company dialog
  const [editCompanyOpen, setEditCompanyOpen] = useState(false)
  const [editCompany, setEditCompany] = useState<Company | null>(null)
  const [editCompanyForm, setEditCompanyForm] = useState({ name: '', is_active: true })
  const [editingCompany, setEditingCompany] = useState(false)

  // Edit user dialog
  const [editUserOpen, setEditUserOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editUserForm, setEditUserForm] = useState({ name: '', role: 'employee', is_active: true })
  const [editingUser, setEditingUser] = useState(false)

  function loadCompanies() {
    setLoadingCompanies(true)
    superAdminApi.get('/super-admin/companies')
      .then((res) => setCompanies(res.data.items ?? res.data))
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setLoadingCompanies(false))
  }

  function loadUsers() {
    setLoadingUsers(true)
    superAdminApi.get('/super-admin/users')
      .then((res) => setUsers(res.data.items ?? res.data))
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setLoadingUsers(false))
  }

  useEffect(() => {
    loadCompanies()
    loadUsers()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await superAdminApi.post('/super-admin/companies', createForm)
      toast.success(`Company "${res.data.company.name}" created!`)
      setCreateOpen(false)
      setCreateForm({ company_name: '', company_description: '', admin_name: '', admin_email: '', admin_password: '' })
      loadCompanies()
      loadUsers()
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setCreating(false)
    }
  }

  function openEditCompany(c: Company) {
    setEditCompany(c)
    setEditCompanyForm({ name: c.name, is_active: c.is_active })
    setEditCompanyOpen(true)
    setOpenMenu(null)
  }

  async function handleUpdateCompany(e: React.FormEvent) {
    e.preventDefault()
    if (!editCompany) return
    setEditingCompany(true)
    try {
      await superAdminApi.patch('/super-admin/companies/update', {
        company_id: editCompany.id,
        name: editCompanyForm.name,
        is_active: editCompanyForm.is_active,
      })
      toast.success('Company updated!')
      setEditCompanyOpen(false)
      loadCompanies()
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setEditingCompany(false)
    }
  }

  function openEditUser(u: User) {
    setEditUser(u)
    setEditUserForm({ name: u.name, role: u.role, is_active: u.is_active })
    setEditUserOpen(true)
    setOpenMenu(null)
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault()
    if (!editUser) return
    setEditingUser(true)
    try {
      await superAdminApi.patch('/super-admin/users/update', {
        user_id: editUser.id,
        name: editUserForm.name,
        role: editUserForm.role,
        is_active: editUserForm.is_active,
      })
      toast.success('User updated!')
      setEditUserOpen(false)
      loadUsers()
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setEditingUser(false)
    }
  }

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div ref={menuRef} className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-[32px] font-medium text-[#07472e] tracking-[-0.96px] leading-[1.5]">Users</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="bg-[#c8f481] text-[#07472e] font-medium text-[16px] tracking-[-0.16px] rounded-xl px-6 h-12 hover:bg-[#b8e56e] transition"
        >
          Create Company
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-1 items-center gap-2 border border-[#07472e] rounded-xl px-4 py-3">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[16px] text-[#07472e] placeholder:text-[#647a6b] outline-none tracking-[-0.16px]"
          />
        </div>
      </div>

      {/* Companies board */}
      <div className="bg-[rgba(7,71,46,0.06)] rounded-2xl p-4 flex flex-col gap-2">
        <p className="text-[13px] font-medium text-[#647a6b] px-4 mb-1">Companies</p>
        {/* Column headers */}
        <div className="flex items-center gap-2 px-4 h-10">
          <span className="flex-1 text-[16px] text-[#647a6b] tracking-[-0.16px]">Name</span>
          <span className="flex-1 text-[16px] text-[#647a6b] tracking-[-0.16px]">Description</span>
          <span className="w-20 text-[16px] text-[#647a6b] tracking-[-0.16px]">Status</span>
          <span className="w-10" />
        </div>

        {loadingCompanies ? (
          <div className="space-y-2 px-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl bg-[#07472e]/5" />)}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <p className="py-8 text-center text-[#647a6b] text-sm">
            {search ? 'No companies match your search' : 'No companies yet'}
          </p>
        ) : (
          filteredCompanies.map((c) => (
            <div key={c.id} className="flex items-center gap-2 px-4 py-3.5 border-b border-[rgba(7,71,46,0.12)] last:border-0">
              <p className="flex-1 text-[16px] font-medium text-[#07472e] tracking-[-0.16px]">{c.name}</p>
              <p className="flex-1 text-[16px] text-[#647a6b] tracking-[-0.16px] truncate">{c.description || '—'}</p>
              <div className="w-20">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${c.is_active ? 'bg-[#07472e]/10 text-[#07472e]' : 'bg-red-100 text-red-700'}`}>
                  {c.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="w-10 relative">
                <button
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[rgba(7,71,46,0.08)] text-[#647a6b]"
                  onClick={() => setOpenMenu(openMenu === `c-${c.id}` ? null : `c-${c.id}`)}
                >
                  <DotsIcon />
                </button>
                {openMenu === `c-${c.id}` && (
                  <div className="absolute right-0 top-11 z-20 bg-white rounded-2xl shadow-[0px_4px_100px_0px_rgba(7,71,46,0.16)] p-2 w-[180px] border border-[rgba(7,71,46,0.08)]">
                    <button
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-[rgba(7,71,46,0.06)] text-[#07472e] text-[15px] font-medium"
                      onClick={() => openEditCompany(c)}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit company
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* All Users board */}
      <div className="bg-[rgba(7,71,46,0.06)] rounded-2xl p-4 flex flex-col gap-2">
        <p className="text-[13px] font-medium text-[#647a6b] px-4 mb-1">All Users</p>
        {/* Column headers */}
        <div className="flex items-center gap-2 px-4 h-10">
          <span className="flex-1 text-[16px] text-[#647a6b] tracking-[-0.16px]">Name</span>
          <span className="flex-1 text-[16px] text-[#647a6b] tracking-[-0.16px]">Email</span>
          <span className="w-28 text-[16px] text-[#647a6b] tracking-[-0.16px]">Role</span>
          <span className="w-20 text-[16px] text-[#647a6b] tracking-[-0.16px]">Status</span>
          <span className="w-10" />
        </div>

        {loadingUsers ? (
          <div className="space-y-2 px-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl bg-[#07472e]/5" />)}
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="py-8 text-center text-[#647a6b] text-sm">
            {search ? 'No users match your search' : 'No users yet'}
          </p>
        ) : (
          filteredUsers.map((u) => (
            <div key={u.id} className="flex items-center gap-2 px-4 py-3.5 border-b border-[rgba(7,71,46,0.12)] last:border-0">
              <p className="flex-1 text-[16px] font-medium text-[#07472e] tracking-[-0.16px]">{u.name}</p>
              <p className="flex-1 text-[16px] text-[#647a6b] tracking-[-0.16px] truncate">{u.email}</p>
              <p className="w-28 text-[16px] text-[#647a6b] tracking-[-0.16px] capitalize">{u.role.replace('_', ' ')}</p>
              <div className="w-20">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.is_active ? 'bg-[#07472e]/10 text-[#07472e]' : 'bg-red-100 text-red-700'}`}>
                  {u.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="w-10 relative">
                <button
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[rgba(7,71,46,0.08)] text-[#647a6b]"
                  onClick={() => setOpenMenu(openMenu === `u-${u.id}` ? null : `u-${u.id}`)}
                >
                  <DotsIcon />
                </button>
                {openMenu === `u-${u.id}` && (
                  <div className="absolute right-0 top-11 z-20 bg-white rounded-2xl shadow-[0px_4px_100px_0px_rgba(7,71,46,0.16)] p-2 w-[160px] border border-[rgba(7,71,46,0.08)]">
                    <button
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-[rgba(7,71,46,0.06)] text-[#07472e] text-[15px] font-medium"
                      onClick={() => openEditUser(u)}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit user
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create company dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-white border-[#07472e]/10 text-[#07472e]">
          <DialogHeader>
            <DialogTitle className="text-[#07472e]">Create Company</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label className="text-[#647a6b]">Company Name</Label>
              <Input required value={createForm.company_name}
                onChange={e => setCreateForm(f => ({ ...f, company_name: e.target.value }))}
                className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] placeholder:text-[#647a6b]"
                placeholder="Acme Corp" />
            </div>
            <div className="space-y-1">
              <Label className="text-[#647a6b]">Company Description</Label>
              <Input value={createForm.company_description}
                onChange={e => setCreateForm(f => ({ ...f, company_description: e.target.value }))}
                className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] placeholder:text-[#647a6b]"
                placeholder="Optional" />
            </div>
            <div className="border-t border-[#07472e]/10 pt-3">
              <p className="text-xs text-[#647a6b] mb-3">Admin Account</p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[#647a6b]">Admin Name</Label>
                  <Input required value={createForm.admin_name}
                    onChange={e => setCreateForm(f => ({ ...f, admin_name: e.target.value }))}
                    className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] placeholder:text-[#647a6b]"
                    placeholder="John Admin" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[#647a6b]">Admin Email</Label>
                  <Input required type="email" value={createForm.admin_email}
                    onChange={e => setCreateForm(f => ({ ...f, admin_email: e.target.value }))}
                    className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] placeholder:text-[#647a6b]"
                    placeholder="admin@acme.com" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[#647a6b]">Admin Password</Label>
                  <Input required type="password" value={createForm.admin_password}
                    onChange={e => setCreateForm(f => ({ ...f, admin_password: e.target.value }))}
                    className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] placeholder:text-[#647a6b]"
                    placeholder="••••••••" />
                </div>
              </div>
            </div>
            <button type="submit" disabled={creating}
              className="w-full bg-[#07472e] text-[#fbfff3] rounded-xl h-12 font-medium hover:bg-[#05351f] transition disabled:opacity-60">
              {creating ? 'Creating...' : 'Create Company'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit company dialog */}
      <Dialog open={editCompanyOpen} onOpenChange={setEditCompanyOpen}>
        <DialogContent className="bg-white border-[#07472e]/10 text-[#07472e]">
          <DialogHeader><DialogTitle className="text-[#07472e]">Edit Company</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdateCompany} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label className="text-[#647a6b]">Company Name</Label>
              <Input required value={editCompanyForm.name} onChange={e => setEditCompanyForm(f => ({ ...f, name: e.target.value }))}
                className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e]" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="company-active" checked={editCompanyForm.is_active}
                onChange={e => setEditCompanyForm(f => ({ ...f, is_active: e.target.checked }))}
                className="h-4 w-4 accent-[#07472e]" />
              <Label htmlFor="company-active" className="text-[#647a6b]">Active</Label>
            </div>
            <button type="submit" disabled={editingCompany}
              className="w-full bg-[#07472e] text-[#fbfff3] rounded-xl h-12 font-medium hover:bg-[#05351f] transition disabled:opacity-60">
              {editingCompany ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit user dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="bg-white border-[#07472e]/10 text-[#07472e]">
          <DialogHeader><DialogTitle className="text-[#07472e]">Edit User</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label className="text-[#647a6b]">Full Name</Label>
              <Input required value={editUserForm.name} onChange={e => setEditUserForm(f => ({ ...f, name: e.target.value }))}
                className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e]" />
            </div>
            <div className="space-y-1">
              <Label className="text-[#647a6b]">Role</Label>
              <Select value={editUserForm.role} onValueChange={v => setEditUserForm(f => ({ ...f, role: v }))}>
                <SelectTrigger className="border-[#07472e]/20 bg-[#07472e]/5 text-[#07472e] focus:ring-[#07472e]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="user-active" checked={editUserForm.is_active}
                onChange={e => setEditUserForm(f => ({ ...f, is_active: e.target.checked }))}
                className="h-4 w-4 accent-[#07472e]" />
              <Label htmlFor="user-active" className="text-[#647a6b]">Active</Label>
            </div>
            <button type="submit" disabled={editingUser}
              className="w-full bg-[#07472e] text-[#fbfff3] rounded-xl h-12 font-medium hover:bg-[#05351f] transition disabled:opacity-60">
              {editingUser ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
