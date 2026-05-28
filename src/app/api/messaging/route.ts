import { NextResponse } from 'next/server';
import { messagingRepo } from '@/lib/marketplace/repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/messaging?role=customer&email=foo@bar.com
// GET /api/messaging?role=company&companySlug=xyz
// GET /api/messaging?threadId=THR-...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get('threadId');
  if (threadId) {
    const messages = await messagingRepo.listMessages(threadId);
    return NextResponse.json({ threadId, messages });
  }
  const role = searchParams.get('role');
  if (role === 'company') {
    const companySlug = searchParams.get('companySlug');
    if (!companySlug) return NextResponse.json({ error: 'Brak companySlug' }, { status: 400 });
    return NextResponse.json({ threads: await messagingRepo.threadsForCompany(companySlug) });
  }
  if (role === 'customer') {
    const email = searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'Brak email' }, { status: 400 });
    return NextResponse.json({ threads: await messagingRepo.threadsForCustomer(email) });
  }
  return NextResponse.json({ error: 'Brak parametru role lub threadId' }, { status: 400 });
}

// POST /api/messaging
//  body: { threadId, authorRole, authorName, body, attachments? }
//  OR  : { companySlug, customerEmail, customerName, subject, body, authorRole }
export async function POST(req: Request) {
  try {
    const data = await req.json();
    let threadId: string | undefined = data.threadId;

    if (!threadId) {
      if (!data.companySlug || !data.customerEmail || !data.subject) {
        return NextResponse.json(
          { error: 'Wymagane: companySlug, customerEmail, subject lub threadId' },
          { status: 400 },
        );
      }
      const t = await messagingRepo.ensureThread({
        companySlug: data.companySlug,
        customerEmail: data.customerEmail,
        customerName: data.customerName || 'Klient',
        subject: data.subject,
      });
      threadId = t.id;
    }

    if (!data.body || typeof data.body !== 'string' || data.body.trim().length === 0) {
      return NextResponse.json({ error: 'Treść wiadomości jest wymagana' }, { status: 400 });
    }
    if (data.body.length > 4000) {
      return NextResponse.json({ error: 'Wiadomość zbyt długa (max 4000)' }, { status: 400 });
    }

    const role = data.authorRole === 'company' ? 'company' : 'customer';
    const msg = await messagingRepo.post(threadId!, {
      authorRole: role,
      authorName: data.authorName || (role === 'company' ? 'Firma' : 'Klient'),
      body: data.body.trim(),
      attachments: Array.isArray(data.attachments) ? data.attachments : undefined,
    });
    if (!msg) return NextResponse.json({ error: 'Wątek nie istnieje' }, { status: 404 });

    return NextResponse.json({ ok: true, threadId, message: msg });
  } catch (e: any) {
    console.error('Messaging error:', e);
    return NextResponse.json({ error: 'Wystąpił błąd' }, { status: 500 });
  }
}

// PATCH /api/messaging  body:{threadId, role:'company'|'customer', action:'markRead'}
export async function PATCH(req: Request) {
  try {
    const { threadId, role, action } = await req.json();
    if (!threadId || !role || action !== 'markRead') {
      return NextResponse.json({ error: 'Niepoprawne dane' }, { status: 400 });
    }
    await messagingRepo.markRead(threadId, role);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Wystąpił błąd' }, { status: 500 });
  }
}
