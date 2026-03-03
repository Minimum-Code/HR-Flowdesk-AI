import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PLANS, PlanKey } from '@/lib/plans'
import { rateLimit } from '@/lib/rate-limit'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
    const { allowed, retryAfterMs } = rateLimit(`checkout:${ip}`, 10, 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
      )
    }

    const { plan } = await req.json()
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const planConfig = PLANS[plan as PlanKey]
    if (!planConfig?.priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get current user from Xano
    const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_AUTH}/auth/me`, {
      headers: { Authorization: authHeader },
    })
    if (!meRes.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = await meRes.json()

    // Find or create Stripe customer by email
    const existing = await stripe.customers.list({ email: user.email, limit: 1 })
    let customer = existing.data[0]
    if (!customer) {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { company_id: String(user.company_id ?? '') },
      })
    }

    // If customer already has an active subscription, create a portal session instead
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    })
    if (subscriptions.data.length > 0) {
      const portal = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        configuration: process.env.STRIPE_PORTAL_CONFIG,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/billing`,
      })
      return NextResponse.json({ url: portal.url, isPortal: true })
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/billing`,
      client_reference_id: String(user.company_id ?? ''),
      metadata: {
        company_id: String(user.company_id ?? ''),
        plan,
      },
      subscription_data: {
        metadata: {
          company_id: String(user.company_id ?? ''),
          plan,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
