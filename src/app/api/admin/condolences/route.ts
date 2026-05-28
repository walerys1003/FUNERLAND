import { NextResponse } from 'next/server';
import { condolenceStore } from '@/lib/marketplace/store';
import { getServerUser, AUTH_CONFIGURED } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function isAdmin(): Promise<boolean> {
  if (!AUTH_CONFIGURED) return true; // demo mode
  const u = await getServerUser();
  return u?.role === 'admin';
}

// GET /api/admin/condolences?status=pending|all
export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const url = new URL(req.url);
  const status = url.searchParams.get('status') || 'pending';
  const items = status === 'all' ? condolenceStore.listRecent(100) : condolenceStore.listPending();
  return NextResponse.json({ items, count: items.length });
}

// PATCH /api/admin/condolences  { id, action: 'approve' | 'reject' }
export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const id = String(body?.id || '');
  const action = body?.action === 'reject' ? 'rejected' : 'approved';
  if (!id) return NextResponse.json({ error: 'Brak id' }, { status: 400 });
  const res = condolenceStore.setStatus(id, action as any);
  if (!res) return NextResponse.json({ error: 'Nie znaleziono wpisu' }, { status: 404 });
  return NextResponse.json({ ok: true, condolence: res });
}
