'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { authApi, getApiError } from '@/lib/api'
import AuthLeftPanel from '@/components/auth/auth-left-panel'

const inputCls = 'w-full border border-[#07472e] rounded-xl px-4 py-3 text-[16px] text-[#07472e] placeholder:text-[#647a6b] bg-transparent outline-none focus:ring-2 focus:ring-[#07472e]/20 transition'

function Logo() {
  return (
    <div className="flex items-center">
      <img src="/logo.svg" alt="HR Flowdesk" className="h-10 w-auto" />
    </div>
  )
}

function ResetPasswordContent() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await authApi.post('/auth/reset-password',
        { new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Password reset successfully!')
      setDone(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#fbfff3]"><div className="relative min-h-screen bg-[#fbfff3] flex items-center justify-end max-w-[1440px] mx-auto">
      <AuthLeftPanel />
      <div className="w-full lg:w-[717px] flex items-center justify-center px-8 py-16 min-h-screen">

        {/* ── Token flow: Create a new password ── */}
        {token ? (
          <div className="flex flex-col items-center gap-10 w-[400px] max-w-full">
            <Logo />
            {done ? (
              <div className="flex flex-col gap-6 w-full">
                <div className="flex flex-col gap-1">
                  <h1 className="text-[32px] font-medium leading-[1.5] tracking-[-0.96px] text-[#07472e]">Password updated!</h1>
                  <p className="text-[16px] text-[#647a6b] leading-[1.4] tracking-[-0.16px]">Redirecting to login...</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-6 w-full">
                <h1 className="text-[32px] font-medium leading-[1.5] tracking-[-0.96px] text-[#07472e]">
                  Create a new password
                </h1>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[15px] text-[#647a6b] tracking-[-0.15px]">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        className={inputCls + ' pr-11'}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#647a6b] hover:text-[#07472e]">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[15px] text-[#647a6b] tracking-[-0.15px]">Confirm password</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Enter your password"
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
                <button type="submit" disabled={loading}
                  className="w-full bg-[#07472e] text-[#fbfff3] rounded-xl h-12 text-[16px] font-medium tracking-[-0.16px] hover:bg-[#05351f] transition disabled:opacity-60">
                  {loading ? 'Saving...' : 'Change password'}
                </button>
              </form>
            )}
          </div>

        /* ── Forgot password flow ── */
        ) : sent ? (
          <div className="flex flex-col items-center gap-10 w-[400px] max-w-full">
            <Logo />
            <div className="flex flex-col gap-6 w-full">
              <div className="flex flex-col gap-1">
                <h1 className="text-[32px] font-medium leading-[1.5] tracking-[-0.96px] text-[#07472e]">Email sent</h1>
                <p className="text-[16px] text-[#647a6b] leading-[1.4] tracking-[-0.16px]">
                  We&apos;ve sent a password reset link to{' '}
                  <strong className="text-[#07472e]">{email}</strong>.
                  Check your inbox and follow the instructions.
                </p>
              </div>
              <Link href="/login"
                className="w-full bg-[#07472e] text-[#fbfff3] rounded-xl h-12 text-[16px] font-medium tracking-[-0.16px] hover:bg-[#05351f] transition flex items-center justify-center">
                Back to Sign In
              </Link>
              <p className="text-center text-[16px] text-[#07472e] tracking-[-0.16px]">
                <Link href="/reset-password" onClick={() => setSent(false)} className="underline underline-offset-2">
                  Resend email
                </Link>
              </p>
            </div>
          </div>

        ) : (
          <div className="flex flex-col items-center gap-10 w-[400px] max-w-full">
            <Logo />
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-6 w-full">
              <button type="button" onClick={() => router.back()}
                className="self-start bg-[#e8f5ee] text-[#07472e] text-[14px] font-medium px-4 py-1.5 rounded-full hover:bg-[#d4eedd] transition">
                Back
              </button>
              <div className="flex flex-col gap-1">
                <h1 className="text-[32px] font-medium leading-[1.5] tracking-[-0.96px] text-[#07472e]">Reset password</h1>
                <p className="text-[16px] text-[#647a6b] leading-[1.4] tracking-[-0.16px]">
                  Please enter your email address, and we will send you an email to reset your password.
                </p>
              </div>
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
              <button type="submit" disabled={loading}
                className="w-full bg-[#07472e] text-[#fbfff3] rounded-xl h-12 text-[16px] font-medium tracking-[-0.16px] hover:bg-[#05351f] transition disabled:opacity-60">
                {loading ? 'Sending...' : 'Continue'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div></div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  )
}
