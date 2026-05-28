/**
 * Lead notifications — real implementation (Sprint 2).
 *
 * Po otrzymaniu nowego leada:
 *  1) Wysyła e-mail potwierdzenia do rodziny (jeśli email podany)
 *  2) Wysyła SMS potwierdzenia do rodziny
 *  3) (W kolejnym kroku — matchowanie firm) wysyła alert email+sms do firm
 *
 * Każda wysyłka jest best-effort — błąd jednej nie blokuje pozostałych.
 */

import { sendEmail } from '@/lib/resend';
import { sendFamilyConfirmation, sendCompanyLeadAlert } from '@/lib/sms';
import { captureException } from '@/lib/observability/sentry';

export type LeadNotificationPayload = {
  leadId: string;
  score?: number;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  budget?: string;
  urgency?: string;
  message?: string;
  companySlug?: string;
};

export type LeadNotificationResult = {
  familyEmail: { ok: boolean; id?: string; error?: string };
  familySms: { ok: boolean; id?: string; error?: string };
};

export async function sendLeadNotifications(
  payload: LeadNotificationPayload
): Promise<LeadNotificationResult> {
  const result: LeadNotificationResult = {
    familyEmail: { ok: false },
    familySms: { ok: false },
  };

  // 1) Email potwierdzenia do rodziny
  if (payload.email && !payload.email.endsWith('@anonim.local')) {
    try {
      const { id } = await sendEmail({
        to: payload.email,
        template: 'family-confirmation',
        data: {
          name: payload.name,
          leadId: payload.leadId,
        },
      });
      result.familyEmail = { ok: true, id };
    } catch (e: any) {
      result.familyEmail = { ok: false, error: e?.message || 'send-failed' };
      captureException(e, { context: 'lead-notification:family-email', leadId: payload.leadId });
    }
  }

  // 2) SMS potwierdzenia do rodziny
  if (payload.phone) {
    try {
      const { id } = await sendFamilyConfirmation({
        to: payload.phone,
        leadId: payload.leadId,
      });
      result.familySms = { ok: true, id };
    } catch (e: any) {
      result.familySms = { ok: false, error: e?.message || 'send-failed' };
      captureException(e, { context: 'lead-notification:family-sms', leadId: payload.leadId });
    }
  }

  return result;
}

/**
 * Powiadom firmę o nowym leadzie — email + SMS (jeśli urgency=asap).
 */
export async function notifyCompanyOfLead(opts: {
  companyEmail?: string;
  companyPhone?: string;
  leadId: string;
  familyName?: string;
  familyPhone?: string;
  city?: string;
  budget?: string;
  urgency?: string;
  message?: string;
  score?: number;
  leadUrl?: string;
}): Promise<{ email?: { ok: boolean; id?: string; error?: string }; sms?: { ok: boolean; id?: string } }> {
  const out: any = {};

  if (opts.companyEmail) {
    try {
      const r = await sendEmail({
        to: opts.companyEmail,
        template: 'company-new-lead',
        data: {
          familyName: opts.familyName,
          familyPhone: opts.familyPhone,
          city: opts.city,
          budget: opts.budget,
          urgency: opts.urgency,
          message: opts.message,
          score: opts.score,
          leadUrl:
            opts.leadUrl || `${process.env.NEXT_PUBLIC_SITE_URL || ''}/panel-firmy/leady/${opts.leadId}`,
        },
      });
      out.email = { ok: true, id: r.id };
    } catch (e: any) {
      out.email = { ok: false, error: e?.message };
      captureException(e, { context: 'lead-notification:company-email', leadId: opts.leadId });
    }
  }

  // SMS tylko dla pilnych leadów (oszczędność kosztów)
  if (opts.companyPhone && opts.urgency === 'asap') {
    try {
      const r = await sendCompanyLeadAlert({
        to: opts.companyPhone,
        leadId: opts.leadId,
        city: opts.city,
        budget: opts.budget,
        urgency: opts.urgency,
      });
      out.sms = { ok: true, id: r.id };
    } catch (e: any) {
      out.sms = { ok: false, error: e?.message };
      captureException(e, { context: 'lead-notification:company-sms', leadId: opts.leadId });
    }
  }

  return out;
}
