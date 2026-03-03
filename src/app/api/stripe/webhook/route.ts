import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// In-memory idempotency store (prevents duplicate processing on Stripe retries)
// Stores event IDs for 24h — replace with Redis for multi-instance deployments
const processedEvents = new Map<string, number>()
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000

function isAlreadyProcessed(eventId: string): boolean {
  const processedAt = processedEvents.get(eventId)
  if (!processedAt) return false
  if (Date.now() - processedAt > IDEMPOTENCY_TTL) {
    processedEvents.delete(eventId)
    return false
  }
  return true
}

function markProcessed(eventId: string): void {
  processedEvents.set(eventId, Date.now())
  // Clean up old entries
  if (processedEvents.size > 1000) {
    const cutoff = Date.now() - IDEMPOTENCY_TTL
    for (const [id, ts] of processedEvents.entries()) {
      if (ts < cutoff) processedEvents.delete(id)
    }
  }
}

// Get a super admin JWT to call Xano
async function getSuperAdminToken(): Promise<string | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_AUTH}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.XANO_SA_EMAIL,
        password: process.env.XANO_SA_PASSWORD,
      }),
    })
    const data = await res.json()
    return data.authToken ?? null
  } catch {
    return null
  }
}

// Update or create Xano subscription for the company
async function syncSubscriptionToXano(companyId: number, plan: string, status: string) {
  const token = await getSuperAdminToken()
  if (!token) {
    console.error('Could not get super admin token for Xano sync')
    return
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_SUPER_ADMIN!

  // Find existing subscription for this company
  const subsRes = await fetch(`${baseUrl}/super-admin/payments`, { headers })
  const subsData = await subsRes.json()
  const subs: { id: number; company_id: number }[] = subsData.items ?? subsData
  const existing = subs.find((s) => s.company_id === companyId)

  const xanoStatus = status === 'active' ? 'active'
    : status === 'past_due' ? 'inactive'
    : status === 'canceled' || status === 'cancelled' ? 'cancelled'
    : status === 'trialing' ? 'trial'
    : 'inactive'

  if (existing) {
    await fetch(`${baseUrl}/super-admin/payments/update`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        subscription_id: existing.id,
        plan,
        status: xanoStatus,
      }),
    })
  } else {
    await fetch(`${baseUrl}/super-admin/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ company_id: companyId, plan, status: xanoStatus }),
    })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (isAlreadyProcessed(event.id)) {
    return NextResponse.json({ received: true })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const companyId = Number(session.client_reference_id || session.metadata?.company_id)
        const plan = session.metadata?.plan ?? 'starter'
        if (companyId) await syncSubscriptionToXano(companyId, plan, 'active')
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const companyId = Number(sub.metadata?.company_id)
        const plan = sub.metadata?.plan ?? 'starter'
        if (companyId) await syncSubscriptionToXano(companyId, plan, sub.status)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const companyId = Number(sub.metadata?.company_id)
        const plan = sub.metadata?.plan ?? 'starter'
        if (companyId) await syncSubscriptionToXano(companyId, plan, 'cancelled')
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const customers = await stripe.subscriptions.list({ customer: customerId, limit: 1 })
        const sub = customers.data[0]
        if (sub) {
          const companyId = Number(sub.metadata?.company_id)
          const plan = sub.metadata?.plan ?? 'starter'
          if (companyId) await syncSubscriptionToXano(companyId, plan, 'inactive')
        }
        break
      }
    }
    markProcessed(event.id)
  } catch (err) {
    console.error('Webhook handler error:', { eventType: event.type, eventId: event.id, err })
    // Return 200 to prevent Stripe from retrying for handler errors
  }

  return NextResponse.json({ received: true })
}
