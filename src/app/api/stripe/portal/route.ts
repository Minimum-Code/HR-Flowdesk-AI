import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_AUTH}/auth/me`, {
      headers: { Authorization: authHeader },
    })
    if (!meRes.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await meRes.json()

    const customers = await stripe.customers.list({ email: user.email, limit: 1 })
    const customer = customers.data[0]
    if (!customer) return NextResponse.json({ error: 'No subscription found' }, { status: 404 })

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      configuration: process.env.STRIPE_PORTAL_CONFIG,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe portal error:', err)
    return NextResponse.json({ error: 'Failed to open portal' }, { status: 500 })
  }
}
