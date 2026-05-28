import { NextResponse } from 'next/server';

/**
 * POST /api/lead
 * Tworzy nowego leada (rodziny szukającej firmy) + uruchamia routing do 3 firm
 *
 * Body: {
 *   family_name, family_phone, family_email,
 *   city_slug, district,
 *   ceremony_type, budget_range, needed_date, urgent,
 *   notes, consents,
 *   utm_source, utm_medium, utm_campaign
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ===== WALIDACJA =====
    const required = ['family_name', 'family_phone', 'city_slug'];
    for (const field of required) {
      if (!body[field] || typeof body[field] !== 'string' || !body[field].trim()) {
        return NextResponse.json(
          { error: `Pole ${field} jest wymagane` },
          { status: 400 }
        );
      }
    }

    // RODO consent
    if (!body.consents?.rodo) {
      return NextResponse.json(
        { error: 'Wymagana zgoda RODO' },
        { status: 400 }
      );
    }

    // Telefon PL
    const phoneClean = body.family_phone.replace(/\s+/g, '');
    if (!/^(\+48)?[0-9]{9}$/.test(phoneClean)) {
      return NextResponse.json(
        { error: 'Nieprawidłowy numer telefonu' },
        { status: 400 }
      );
    }

    // ===== LEAD SCORING =====
    let score = 50;
    if (body.urgent) score += 30;
    if (body.budget_range === '25k+') score += 20;
    else if (body.budget_range === '15-25k') score += 10;
    if (body.family_email) score += 5;
    if (body.needed_date) {
      const days = Math.ceil(
        (new Date(body.needed_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (days <= 3) score += 25;
      else if (days <= 7) score += 15;
    }

    // ===== INSERT LEAD =====
    // const { supabaseAdmin } = await import('@/lib/supabase/admin');
    // const supabase = supabaseAdmin();
    //
    // const { data: city } = await supabase
    //   .from('cities')
    //   .select('id')
    //   .eq('slug', body.city_slug)
    //   .single();
    //
    // const { data: lead, error } = await supabase
    //   .from('leads')
    //   .insert({
    //     family_name: body.family_name.trim(),
    //     family_phone: phoneClean,
    //     family_email: body.family_email?.trim() || null,
    //     city_id: city?.id,
    //     district: body.district,
    //     ceremony_type: body.ceremony_type,
    //     budget_range: body.budget_range,
    //     needed_date: body.needed_date,
    //     urgent: !!body.urgent,
    //     notes: body.notes,
    //     consents: body.consents,
    //     score,
    //     utm_source: body.utm_source,
    //     utm_medium: body.utm_medium,
    //     utm_campaign: body.utm_campaign,
    //   })
    //   .select()
    //   .single();
    //
    // if (error) throw error;

    // MOCK LEAD (przed podłączeniem Supabase)
    const lead = {
      id: 'lead_' + Math.random().toString(36).slice(2, 12),
      score,
      created_at: new Date().toISOString(),
    };

    // ===== ROUTING — dopasuj 3 firmy =====
    // logika: kategorie, miasto, plan, response time, rating, kapacitet
    const matchedCompanies = await matchCompanies({
      cityId: 1, // city?.id
      ceremonyType: body.ceremony_type,
      score,
    });

    // ===== POWIADOMIENIA =====
    // Email do rodziny — potwierdzenie
    await sendFamilyConfirmation({
      email: body.family_email,
      name: body.family_name,
      leadId: lead.id,
    });

    // Email + SMS do dopasowanych firm
    for (const company of matchedCompanies) {
      await notifyCompany({ company, lead });
    }

    return NextResponse.json({
      ok: true,
      leadId: lead.id,
      score,
      matchedCompanies: matchedCompanies.length,
      message: 'Otrzymasz 3 oferty w ciągu 24 godzin',
    });
  } catch (err: any) {
    console.error('[/api/lead] error:', err);
    return NextResponse.json(
      { error: 'Wystąpił błąd. Spróbuj ponownie.' },
      { status: 500 }
    );
  }
}

// ===== HELPERS =====
async function matchCompanies({
  cityId,
  ceremonyType,
  score,
}: {
  cityId: number;
  ceremonyType?: string;
  score: number;
}) {
  // TODO: query Supabase z scoring algorithm
  // - kategoria match
  // - dostępność 24/7
  // - plan (premium > pro > basic)
  // - rating > 4.5
  // - response_time_avg < 30 min
  // - capacity (max 5 aktywnych leadów / firma)
  return [
    { id: 'mock-1', email: 'firma1@example.pl', phone: '+48555000001' },
    { id: 'mock-2', email: 'firma2@example.pl', phone: '+48555000002' },
    { id: 'mock-3', email: 'firma3@example.pl', phone: '+48555000003' },
  ];
}

async function sendFamilyConfirmation(_args: any) {
  // TODO: Resend
  // await resend.emails.send({
  //   from: 'Polskie Pogrzeby <kontakt@polskie-pogrzeby.pl>',
  //   to: args.email,
  //   subject: 'Otrzymaliśmy Twoje zapytanie',
  //   react: FamilyConfirmationEmail({ name: args.name, leadId: args.leadId })
  // });
}

async function notifyCompany(_args: any) {
  // TODO: Resend + SMSAPI.pl
  // await resend.emails.send(...);
  // await smsapi.sms.send(...);
}
