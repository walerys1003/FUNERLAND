import { NextResponse } from 'next/server';
import { leadRepo } from '@/lib/marketplace/repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/leads?company=zaklad-kalla&status=new
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const company = searchParams.get('company');
  const status = searchParams.get('status');
  if (!company) return NextResponse.json({ error: 'Brak parametru company' }, { status: 400 });
  const all = await leadRepo.forCompany(company);
  const leads = status ? all.filter((l) => l.status === status) : all;
  return NextResponse.json({
    company,
    counts: {
      new: all.filter((l) => l.status === 'new').length,
      contacted: all.filter((l) => l.status === 'contacted').length,
      won: all.filter((l) => l.status === 'won').length,
      lost: all.filter((l) => l.status === 'lost').length,
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
  const l = await leadRepo.updateStatus(id, status);
  if (!l) return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });
  return NextResponse.json({ ok: true, lead: l });
}
