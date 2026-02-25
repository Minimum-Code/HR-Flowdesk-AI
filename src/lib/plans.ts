export type PlanKey = 'free' | 'starter' | 'pro' | 'enterprise'

export interface PlanLimit {
  label: string
  price: number
  priceId: string | null
  maxHrs: number | null       // null = unlimited
  maxEmployees: number | null
  maxCategories: number | null
  features: string[]
}

export const PLANS: Record<PlanKey, PlanLimit> = {
  free: {
    label: 'Free',
    price: 0,
    priceId: null,
    maxHrs: 1,
    maxEmployees: 10,
    maxCategories: 3,
    features: [
      '1 HR manager',
      'Up to 10 employees',
      '3 ticket categories',
      'Basic ticket management',
    ],
  },
  starter: {
    label: 'Starter',
    price: 29,
    priceId: 'price_1T4MxnRqyZ8ZZYN9PY8o3BU8',
    maxHrs: 5,
    maxEmployees: 100,
    maxCategories: 10,
    features: [
      '5 HR managers',
      'Up to 100 employees',
      '10 ticket categories',
      'Unlimited tickets',
      'Email notifications',
    ],
  },
  pro: {
    label: 'Pro',
    price: 79,
    priceId: 'price_1T4MxnRqyZ8ZZYN98KFRANmV',
    maxHrs: 15,
    maxEmployees: 500,
    maxCategories: 50,
    features: [
      '15 HR managers',
      'Up to 500 employees',
      '50 ticket categories',
      'Unlimited tickets',
      'Analytics dashboard',
      'Priority support',
    ],
  },
  enterprise: {
    label: 'Enterprise',
    price: 199,
    priceId: 'price_1T4MxoRqyZ8ZZYN9IOwnqSOm',
    maxHrs: null,
    maxEmployees: null,
    maxCategories: null,
    features: [
      'Unlimited HR managers',
      'Unlimited employees',
      'Unlimited categories',
      'Unlimited tickets',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
}

export const PLAN_ORDER: PlanKey[] = ['free', 'starter', 'pro', 'enterprise']

export function getPlanRank(plan: string): number {
  return PLAN_ORDER.indexOf(plan as PlanKey)
}
