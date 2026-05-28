/**
 * Audit log — RODO + security trail.
 *
 * Każda zmiana wrażliwych danych powinna trafić tutaj:
 *  - logowania (success/fail)
 *  - reset hasła
 *  - zmiana roli
 *  - dostęp do leadów (lead reveal)
 *  - export/delete konta (RODO)
 *  - 2FA enable/disable
 *  - moderacja recenzji
 *
 * W demo mode (brak Supabase) trzyma ostatnie 200 wpisów w pamięci dla podglądu w panelu.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY) && process.env.USE_SUPABASE !== 'false';

let client: ReturnType<typeof createClient> | null = null;
function getClient() {
  if (!USE_SUPABASE) return null;
  if (!client) client = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, { auth: { persistSession: false } });
  return client;
}

export type AuditAction =
  | 'auth.login.success'
  | 'auth.login.failed'
  | 'auth.logout'
  | 'auth.password.reset_requested'
  | 'auth.password.reset_completed'
  | 'auth.role.changed'
  | 'auth.2fa.enabled'
  | 'auth.2fa.disabled'
  | 'auth.2fa.verified'
  | 'lead.created'
  | 'lead.viewed'
  | 'lead.reveal_paid'
  | 'review.submitted'
  | 'review.approved'
  | 'review.rejected'
  | 'review.auto_flagged'
  | 'billing.checkout.completed'
  | 'billing.subscription.canceled'
  | 'billing.payment.failed'
  | 'company.claimed'
  | 'company.verified'
  | 'data.export'
  | 'data.delete';

export type AuditEntry = {
  action: AuditAction | string;
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  resourceType?: string;
  resourceId?: string;
  ip?: string;
  userAgent?: string;
  before?: any;
  after?: any;
  meta?: Record<string, any>;
};

// In-memory ring buffer (demo)
const memoryRing: Array<AuditEntry & { occurredAt: string }> = [];

export async function audit(entry: AuditEntry): Promise<void> {
  const occurredAt = new Date().toISOString();
  const client = getClient();

  if (!client) {
    memoryRing.push({ ...entry, occurredAt });
    if (memoryRing.length > 200) memoryRing.shift();
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[audit] ${entry.action}`, {
        actor: entry.actorEmail || entry.actorId,
        resource: entry.resourceType ? `${entry.resourceType}#${entry.resourceId}` : undefined,
      });
    }
    return;
  }

  try {
    await (client.from('audit_log') as any).insert({
      action: entry.action,
      actor_id: entry.actorId || null,
      actor_email: entry.actorEmail || null,
      actor_role: entry.actorRole || null,
      resource_type: entry.resourceType || null,
      resource_id: entry.resourceId || null,
      ip: entry.ip || null,
      user_agent: entry.userAgent || null,
      before_data: entry.before ?? null,
      after_data: entry.after ?? null,
      meta: entry.meta ?? {},
    });
  } catch (e) {
    // Audit nie może blokować requesta — loguj tylko
    console.warn('[audit] supabase write failed:', e);
  }
}

export function getRecentAuditMemory(limit = 50) {
  return memoryRing.slice(-limit).reverse();
}

/**
 * Wyciągnij IP + UA z Request (do wbudowania w audit entry).
 */
export function requestContext(req: Request): Pick<AuditEntry, 'ip' | 'userAgent'> {
  return {
    ip:
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  };
}
