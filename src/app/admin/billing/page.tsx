'use client'

import { useEffect, useState, Suspense, Fragment } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { getToken } from '@/lib/api'
import { PLANS, PLAN_ORDER, getPlanRank, type PlanKey } from '@/lib/plans'

interface SubscriptionInfo {
  plan: PlanKey
  status: string | null
  renewsAt: string | null
  cancelAtPeriodEnd: boolean
  subscriptionId: string | null
  customerId: string | null
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-[#07472e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function isSafeStripeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.stripe.com')
  } catch {
    return false
  }
}

function BillingContent() {
  const searchParams = useSearchParams()
  const [sub, setSub] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<PlanKey | null>(null)
  const [openingPortal, setOpeningPortal] = useState(false)

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Subscription activated! Your plan will update shortly.')
    }
    fetchSubscription()
  }, [])

  async function fetchSubscription() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/subscription', {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      setSub(data)
    } catch {
      setSub({ plan: 'free', status: null, renewsAt: null, cancelAtPeriodEnd: false, subscriptionId: null, customerId: null })
    } finally {
      setLoading(false)
    }
  }

  async function handleSubscribe(plan: PlanKey) {
    if (plan === 'free') return
    setSubscribing(plan)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url && isSafeStripeUrl(data.url)) window.location.href = data.url
      else toast.error('Failed to start checkout')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubscribing(null)
    }
  }

  async function handleManage() {
    setOpeningPortal(true)
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.url && isSafeStripeUrl(data.url)) window.location.href = data.url
      else toast.error('Could not open billing portal')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setOpeningPortal(false)
    }
  }

  const currentPlan = sub?.plan ?? 'free'
  const currentRank = getPlanRank(currentPlan)
  const isActive = !sub?.status || sub.status === 'active' || sub.status === 'trialing'

  function getPlanStatus(plan: PlanKey) {
    if (plan === currentPlan && isActive) return 'current'
    if (getPlanRank(plan) < currentRank) return 'downgrade'
    return 'upgrade'
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-medium text-[#07472e] tracking-[-0.96px] leading-[1.5]">Billing</h1>
        {sub?.status && sub.status !== null && sub.plan !== 'free' && (
          <button
            onClick={handleManage}
            disabled={openingPortal}
            className="border border-[#07472e] text-[#07472e] font-medium text-[15px] rounded-xl px-5 h-11 hover:bg-[#07472e]/5 transition disabled:opacity-60"
          >
            {openingPortal ? 'Opening...' : 'Manage Subscription'}
          </button>
        )}
      </div>

      {/* Current plan banner */}
      {!loading && (
        <div className="bg-[#07472e] rounded-2xl px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm">Current plan</p>
            <p className="text-white text-[22px] font-medium tracking-[-0.44px] mt-0.5">
              {PLANS[currentPlan].label}
              {currentPlan !== 'free' && (
                <span className="ml-2 text-base font-normal text-white/60">
                  €{PLANS[currentPlan].price}/month
                </span>
              )}
            </p>
          </div>
          <div className="text-right">
            {sub?.status && sub.status !== null && (
              <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full capitalize ${
                sub.status === 'active' ? 'bg-[#c8f481] text-[#07472e]'
                : sub.status === 'trialing' ? 'bg-blue-100 text-blue-700'
                : 'bg-white/20 text-white/80'
              }`}>
                {sub.cancelAtPeriodEnd ? 'Cancels at period end' : sub.status}
              </span>
            )}
            {sub?.renewsAt && !sub.cancelAtPeriodEnd && (
              <p className="text-white/50 text-xs mt-1.5">Renews {sub.renewsAt}</p>
            )}
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-4 gap-4">
        {PLAN_ORDER.map((plan) => {
          const config = PLANS[plan]
          const status = getPlanStatus(plan)
          const isCurrent = status === 'current'
          const isPopular = plan === 'pro'

          return (
            <div
              key={plan}
              className={`relative rounded-2xl p-6 flex flex-col gap-5 border transition ${
                isCurrent
                  ? 'border-[#07472e] bg-[rgba(7,71,46,0.04)]'
                  : 'border-[rgba(7,71,46,0.12)] bg-white hover:border-[#07472e]/30'
              }`}
            >
              {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c8f481] text-[#07472e] text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                  Most popular
                </span>
              )}

              {/* Plan header */}
              <div>
                <p className="text-[13px] font-medium text-[#647a6b] uppercase tracking-wider">{config.label}</p>
                <div className="mt-1.5 flex items-baseline gap-1">
                  {config.price === 0 ? (
                    <span className="text-[32px] font-medium text-[#07472e] tracking-[-0.96px]">Free</span>
                  ) : (
                    <>
                      <span className="text-[32px] font-medium text-[#07472e] tracking-[-0.96px]">€{config.price}</span>
                      <span className="text-[#647a6b] text-sm">/month</span>
                    </>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[rgba(7,71,46,0.1)]" />

              {/* Features */}
              <ul className="flex flex-col gap-2.5 flex-1">
                {config.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[14px] text-[#07472e]">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => isCurrent ? handleManage() : handleSubscribe(plan)}
                disabled={
                  loading ||
                  plan === 'free' ||
                  status === 'downgrade' ||
                  subscribing === plan ||
                  (isCurrent && openingPortal)
                }
                className={`w-full rounded-xl h-11 text-[15px] font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  isCurrent
                    ? 'bg-[#07472e] text-[#fbfff3] hover:bg-[#05351f]'
                    : plan === 'free' || status === 'downgrade'
                    ? 'border border-[rgba(7,71,46,0.2)] text-[#647a6b] cursor-default'
                    : 'bg-[#c8f481] text-[#07472e] hover:bg-[#b8e56e]'
                }`}
              >
                {loading ? '...'
                  : subscribing === plan ? 'Redirecting...'
                  : isCurrent ? (sub?.subscriptionId ? 'Manage' : 'Current plan')
                  : status === 'downgrade' ? 'Downgrade'
                  : plan === 'free' ? 'Free forever'
                  : currentPlan === 'free' ? 'Subscribe'
                  : 'Upgrade'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Limits reference */}
      <div className="bg-[rgba(7,71,46,0.04)] rounded-2xl p-6">
        <p className="text-[15px] font-medium text-[#07472e] mb-4">Plan limits</p>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div /> {/* spacer */}
          {(['starter', 'pro', 'enterprise'] as PlanKey[]).map((p) => (
            <p key={p} className="font-medium text-[#07472e]">{PLANS[p].label}</p>
          ))}

          {[
            { label: 'HR managers', key: 'maxHrs' as const },
            { label: 'Employees', key: 'maxEmployees' as const },
            { label: 'Categories', key: 'maxCategories' as const },
          ].map(({ label, key }) => (
            <Fragment key={label}>
              <p className="text-[#647a6b]">{label}</p>
              {(['starter', 'pro', 'enterprise'] as PlanKey[]).map((p) => (
                <p key={p} className="font-medium text-[#07472e]">
                  {PLANS[p][key] === null ? 'Unlimited' : PLANS[p][key]}
                </p>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminBillingPage() {
  return (
    <Suspense>
      <BillingContent />
    </Suspense>
  )
}
