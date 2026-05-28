import { NextResponse } from 'next/server';
import { leadStore } from '@/lib/marketplace/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/leads?company=zaklad-kalla&status=new
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const company = searchParams.get('company');
  const status = searchParams.get('status');
  if (!company) return NextResponse.json({ error: 'Brak parametru company' }, { status: 400 });
  let leads = leadStore.forCompany(company);
  if (status) leads = leads.filter((l) => l.status === status);
  return NextResponse.json({
    company,
    counts: {
      new: leadStore.forCompany(company).filter((l) => l.status === 'new').length,
      contacted: leadStore.forCompany(company).filter((l) => l.status === 'contacted').length,
      won: leadStore.forCompany(company).filter((l) => l.status === 'won').length,
      lost: leadStore.forCompany(company).filter((l) => l.status === 'lost').length,
    },
    leads,
  });
}

// PATCH /api/leads  body:{id, status}
export async function PATCH(req: Request) {
  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: 'Niepoprawne dane' }, { status: 400 });
  const allowed = ['new', 'contacted', 'won', 'lost'];
  if (!allowed.includes(status)) return NextResponse.json({ error: 'Niepoprawny status' }, { status: 400 });
  const l = leadStore.updateStatus(id, status);
  if (!l) return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });
  return NextResponse.json({ ok: true, lead: l });
}
