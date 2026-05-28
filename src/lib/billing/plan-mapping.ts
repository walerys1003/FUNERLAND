/**
 * Plan ID mapping between app PlanId and DB subscription_plan enum.
 *
 * App layer uses: 'free' | 'standard' | 'pro' | 'premium'
 * DB enum (after 20260115 migration) accepts:
 *   'free' | 'basic' | 'standard' | 'pro' | 'premium' | 'enterprise'
 *
 * Legacy aliases: 'basic' ≡ 'standard', 'enterprise' ≡ 'premium'.
 * The app always normalises to PlanId on read.
 */

import type { PlanId } from './plans';

/** All values accepted by the DB enum (post-migration). */
export type DbSubscriptionPlan = 'free' | 'basic' | 'standard' | 'pro' | 'premium' | 'enterprise';

/** Convert app PlanId → DB enum value (1:1 since migration added 'free' + 'standard'). */
export function toDbPlan(plan: PlanId): DbSubscriptionPlan {
  return plan as DbSubscriptionPlan;
}

/** Convert DB enum value → app PlanId, collapsing legacy aliases. */
export function fromDbPlan(plan: string | null | undefined): PlanId {
  switch (plan) {
    case 'basic':
      return 'standard';
    case 'enterprise':
      return 'premium';
    case 'free':
    case 'standard':
    case 'pro':
    case 'premium':
      return plan;
    default:
      return 'free';
  }
}

/** Check if a string is a valid DB subscription_plan value. */
export function isValidDbPlan(plan: string | null | undefined): plan is DbSubscriptionPlan {
  return (
    plan === 'free' ||
    plan === 'basic' ||
    plan === 'standard' ||
    plan === 'pro' ||
    plan === 'premium' ||
    plan === 'enterprise'
  );
}
