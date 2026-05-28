import { NextResponse } from 'next/server';
import { LeadSchema, validationError } from '@/lib/validation/schemas';
import { rateLimit, RL_PRESETS } from '@/lib/security/rate-limit';
import { leadRepo } from '@/lib/marketplace/repo';
import { audit, requestContext } from '@/lib/audit/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/lead — formularz kontaktowy / zapytanie ofertowe.
 *
 * Sekurytka:
 *  - rate-limit 5/min per IP (preset `lead`)
 *  - walidacja Zod (LeadSchema)
 *  - honeypot (`website` musi być puste)
 *
 * Następnie:
 *  - lead scoring (urgency, budget, deadline)
 *  - persystencja przez `leadRepo` (Supabase lub in-memory fallback)
 *  - powiadomienia (Resend + SMSAPI) — wpięte w Sprint 2
 */
export async function POST(req: Request) {
  const rl = await rateLimit(req, RL_PRESETS.lead);
  if (!rl.ok) return rl.response;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON' }, { status: 400 });
  }

  // Walidacja (jeśli zainstalowany zod — pełna; w fallback — przepuszczamy)
  const parsed = LeadSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(validationError(parsed as any), { status: 400 });
  }
  const data: any = parsed.data;

  // Honeypot
  if (data.website && String(data.website).length > 0) {
    // udawaj że OK — botowi nie podpowiadamy
    return NextResponse.json({ ok: true, leadId: 'bot_' + Date.now() });
  }

  // RODO consent (przyjmujemy zarówno `consents.rodo` jak i top-level `rodo`)
  const rodoConsent =
    data.consents?.rodo ?? data.rodo ?? (raw as any)?.consents?.rodo ?? true;
  if (rodoConsent === false) {
    return NextResponse.json({ error: 'Wymagana zgoda RODO' }, { status: 400 });
  }

  // Telefon — sanityzacja po walidacji zod
  const phoneClean = String(data.phone || '').replace(/\s+/g, '');

  // ===== LEAD SCORING =====
  let score = 50;
  if (data.urgency === 'asap') score += 30;
  if (data.urgency === 'week') score += 15;
  if (typeof data.budget === 'string') {
    if (data.budget.includes('25k') || data.budget.includes('25+')) score += 20;
    else if (data.budget.includes('15')) score += 10;
  }
  if (data.email) score += 5;

  // ===== PERSYSTENCJA =====
  let leadId = 'lead_' + Math.random().toString(36).slice(2, 12);
  try {
    const saved = await leadRepo.create({
      companySlug: data.companySlug || 'general',
      name: data.name,
      email: data.email || `${phoneClean}@anonim.local`,
      phone: phoneClean,
      city: data.city,
      message:
        (data.message ? data.message + '\n\n' : '') +
        `[budget=${data.budget || '-'}, urgency=${data.urgency || '-'}, score=${score}]`,
      source: 'zapytanie',
    });
    if (saved?.id) leadId = saved.id;
  } catch (e) {
    console.warn('[/api/lead] leadRepo.create failed:', e);
  }

  // ===== AUDIT =====
  audit({
    action: 'lead.created',
    resourceType: 'lead',
    resourceId: leadId,
    ...requestContext(req),
    meta: { score, city: data.city, urgency: data.urgency, budget: data.budget },
  }).catch(() => {});

  // ===== POWIADOMIENIA (Resend + SMSAPI) =====
  try {
    const { sendLeadNotifications } = await import('@/lib/notifications/lead');
    await sendLeadNotifications({ leadId, score, ...data, phone: phoneClean });
  } catch (e) {
    // Brak modułu lub błąd — nie blokuj odpowiedzi 200
    console.warn('[/api/lead] notifications skipped:', (e as any)?.message || e);
  }

  return NextResponse.json({
    ok: true,
    leadId,
    score,
    message: 'Otrzymasz oferty w ciągu 24 godzin',
  });
}
