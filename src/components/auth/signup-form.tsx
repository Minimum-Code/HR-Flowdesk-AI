'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth'
import { getApiError } from '@/lib/api'

const ROLE_DASHBOARDS: Record<string, string> = {
  employee: '/employee/dashboard',
  hr: '/hr/dashboard',
  admin: '/admin/dashboard',
  super_admin: '/super-admin/dashboard',
}

const inputCls = 'w-full border border-[#07472e] rounded-xl px-4 py-3 text-[16px] text-[#07472e] placeholder:text-[#647a6b] bg-transparent outline-none focus:ring-2 focus:ring-[#07472e]/20 transition'

export default function SignupForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('super_admin')
  const [companyId, setCompanyId] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const { signup, isLoading } = useAuthStore()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) return toast.error('Passwords do not match')
    if (!acceptedTerms) return toast.error('Please accept the Terms & Conditions')
    try {
      await signup({ name, email, password, role, company_id: companyId ? Number(companyId) : undefined })
      const userRole = useAuthStore.getState().user?.role
      router.replace(userRole ? ROLE_DASHBOARDS[userRole] : '/')
    } catch (err) {
      toast.error(getApiError(err))
    }
  }

  return (
    <div className="flex flex-col items-center gap-10 w-[400px] max-w-full">
      {/* Logo */}
      <div className="flex items-center">
        <img src="/logo.svg" alt="HR Flowdesk" className="h-10 w-auto" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
        {/* Heading */}
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-medium leading-[1.5] tracking-[-0.96px] text-[#07472e]">Welcome!</h1>
          <p className="text-[16px] font-normal leading-[1.4] tracking-[-0.16px] text-[#647a6b]">
            Register and get access to the dashboard
          </p>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          {/* Full name */}
          <div className="flex flex-col gap-1">
            <label className="text-[15px] text-[#647a6b] tracking-[-0.15px]">Full name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputCls}
            />
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1">
            <label className="text-[15px] text-[#647a6b] tracking-[-0.15px]">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={inputCls + ' appearance-none'}
            >
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="hr">HR Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          {/* Company ID (if not super_admin) */}
          {role !== 'super_admin' && (
            <div className="flex flex-col gap-1">
              <label className="text-[15px] text-[#647a6b] tracking-[-0.15px]">Company ID</label>
              <input
                type="number"
                placeholder="Enter your company ID"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className={inputCls}
              />
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-[15px] text-[#647a6b] tracking-[-0.15px]">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputCls}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-[15px] text-[#647a6b] tracking-[-0.15px]">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputCls + ' pr-11'}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#647a6b] hover:text-[#07472e]">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Repeat Password */}
          <div className="flex flex-col gap-1">
            <label className="text-[15px] text-[#647a6b] tracking-[-0.15px]">Repeat Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Enter your password again"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={inputCls + ' pr-11'}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#647a6b] hover:text-[#07472e]">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Terms checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="h-5 w-5 rounded-full border-2 border-[#07472e] accent-[#07472e] cursor-pointer appearance-none checked:bg-[#07472e] checked:border-[#07472e]"
          />
          <label htmlFor="terms" className="text-[16px] text-[#07472e] tracking-[-0.16px] cursor-pointer">
            I accept{' '}
            <span className="font-medium underline underline-offset-2">Terms &amp; Conditions</span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#07472e] text-[#fbfff3] rounded-xl h-12 text-[16px] font-medium tracking-[-0.16px] hover:bg-[#05351f] transition disabled:opacity-60"
        >
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>

        {/* Sign in link */}
        <p className="text-center text-[16px] text-[#07472e] tracking-[-0.16px] flex items-center justify-center gap-2">
          <span className="font-normal">Already have an account?</span>
          <Link href="/login" className="font-medium underline underline-offset-2">Sign In</Link>
        </p>
      </form>
    </div>
  )
}
