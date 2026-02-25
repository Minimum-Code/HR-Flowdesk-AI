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

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuthStore()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await login(email, password)
      const role = useAuthStore.getState().user?.role
      router.replace(role ? ROLE_DASHBOARDS[role] : '/')
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
        <div className="flex flex-col gap-1 text-[#07472e]">
          <h1 className="text-[32px] font-medium leading-[1.5] tracking-[-0.96px]">Welcome back!</h1>
          <p className="text-[16px] font-normal leading-[1.4] tracking-[-0.16px] text-[#647a6b]">
            Enter the information and access the dashboard
          </p>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-3">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-[15px] text-[#647a6b] tracking-[-0.15px]">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-[#07472e] rounded-xl px-4 py-3 text-[16px] text-[#07472e] placeholder:text-[#647a6b] bg-transparent outline-none focus:ring-2 focus:ring-[#07472e]/20 transition"
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
                className="w-full border border-[#07472e] rounded-xl px-4 py-3 pr-11 text-[16px] text-[#07472e] placeholder:text-[#647a6b] bg-transparent outline-none focus:ring-2 focus:ring-[#07472e]/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#647a6b] hover:text-[#07472e]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <Link
            href="/reset-password"
            className="text-[16px] font-medium text-[#07472e] underline underline-offset-2 tracking-[-0.16px] self-start"
          >
            Forgot password
          </Link>
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            className="h-5 w-5 rounded-full border-[#07472e] accent-[#07472e] cursor-pointer appearance-none border-2 checked:bg-[#07472e] checked:border-[#07472e]"
          />
          <label htmlFor="remember" className="text-[16px] text-[#07472e] tracking-[-0.16px] cursor-pointer">
            Remember Me
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#07472e] text-[#fbfff3] rounded-xl h-12 text-[16px] font-medium tracking-[-0.16px] hover:bg-[#05351f] transition disabled:opacity-60"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        {/* Sign up link */}
        <p className="text-center text-[16px] text-[#07472e] tracking-[-0.16px] flex items-center justify-center gap-2">
          <span className="font-normal">Don&apos;t have an account?</span>
          <Link href="/signup" className="font-medium underline underline-offset-2">Sign Up</Link>
        </p>
      </form>
    </div>
  )
}
