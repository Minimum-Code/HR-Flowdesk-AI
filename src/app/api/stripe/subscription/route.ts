import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { rateLimit } from '@/lib/rate-limit'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
    const { allowed, retryAfterMs } = rateLimit(`subscription:${ip}`, 30, 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
      )
    }

    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ plan: 'free', status: null })
    }

    // Get current user from Xano
    const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_AUTH}/auth/me`, {
      headers: { Authorization: authHeader },
    })
    if (!meRes.ok) return NextResponse.json({ plan: 'free', status: null })
    const user = await meRes.json()

    // Find Stripe customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 })
    const customer = customers.data[0]
    if (!customer) return NextResponse.json({ plan: 'free', status: null })

    // Get active or trialing subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 1,
      expand: ['data.default_payment_method'],
    })

    const sub = subscriptions.data[0]
    if (!sub) return NextResponse.json({ plan: 'free', status: null })

    const plan = (sub.metadata?.plan as string) ?? 'free'
    const periodEnd = sub.items.data[0]?.current_period_end
    const renewsAt = periodEnd
      ? new Date(periodEnd * 1000).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'short', year: 'numeric',
        })
      : null

    return NextResponse.json({
      plan,
      status: sub.status,
      renewsAt,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      subscriptionId: sub.id,
      customerId: customer.id,
    })
  } catch (err) {
    console.error('Stripe subscription error:', err)
    return NextResponse.json({ plan: 'free', status: null })
  }
}
