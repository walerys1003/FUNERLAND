import { NextResponse } from 'next/server';

/**
 * POST /api/claim
 * Firma zgłasza chęć "claim" profilu (weryfikacja przez NIP + email firmowy)
 *
 * Body: { nip, email, phone, full_name, role, company_slug? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Walidacja NIP (10 cyfr + checksum)
    if (!isValidNIP(body.nip)) {
      return NextResponse.json({ error: 'Nieprawidłowy NIP' }, { status: 400 });
    }

    // Email firmowy (nie gmail/wp/o2)
    const freeProviders = ['gmail.com', 'wp.pl', 'o2.pl', 'onet.pl', 'interia.pl', 'tlen.pl'];
    const emailDomain = body.email?.split('@')[1]?.toLowerCase();
    if (!emailDomain || freeProviders.includes(emailDomain)) {
      return NextResponse.json(
        { error: 'Wymagany email firmowy (nie publiczny)' },
        { status: 400 }
      );
    }

    // ===== Sprawdzenie w bazie GUS REGON =====
    // const gusData = await fetchGUS(body.nip);
    // if (!gusData || gusData.status !== 'AKTYWNY') {
    //   return NextResponse.json({ error: 'Firma nieaktywna w REGON' }, { status: 400 });
    // }

    // ===== Generowanie tokenu weryfikacyjnego =====
    const verificationToken = generateToken();

    // TODO: Zapisz claim do Supabase
    // const supabase = supabaseAdmin();
    // await supabase.from('claims').insert({
    //   nip: body.nip,
    //   email: body.email,
    //   phone: body.phone,
    //   full_name: body.full_name,
    //   role: body.role,
    //   company_slug: body.company_slug,
    //   verification_token: verificationToken,
    //   expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
    // });

    // ===== Wyślij email weryfikacyjny =====
    await sendClaimVerification({
      email: body.email,
      name: body.full_name,
      token: verificationToken,
      companySlug: body.company_slug,
    });

    return NextResponse.json({
      ok: true,
      message:
        'Wysłaliśmy link weryfikacyjny na podany email firmowy. Sprawdź skrzynkę (i spam).',
    });
  } catch (err: any) {
    console.error('[/api/claim] error:', err);
    return NextResponse.json(
      { error: 'Wystąpił błąd. Spróbuj ponownie.' },
      { status: 500 }
    );
  }
}

// ===== HELPERS =====
function isValidNIP(nip: string): boolean {
  if (!nip) return false;
  const cleaned = nip.replace(/[\s-]/g, '');
  if (!/^\d{10}$/.test(cleaned)) return false;
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * weights[i];
  const checksum = sum % 11;
  return checksum === parseInt(cleaned[9]);
}

function generateToken(): string {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join('');
}

async function sendClaimVerification(_args: any) {
  // TODO: Resend with template
  // await resend.emails.send({
  //   from: 'Polskie Pogrzeby <claim@polskie-pogrzeby.pl>',
  //   to: args.email,
  //   subject: 'Potwierdź zgłoszenie profilu firmy',
  //   react: ClaimVerificationEmail({ name: args.name, token: args.token, companySlug: args.companySlug })
  // });
}
