import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { condolenceStore } from '@/lib/marketplace/store';
import { obituaryRepo } from '@/lib/marketplace/repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function hashIp(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return createHash('sha256').update(ip + (process.env.SALT || 'pp')).digest('hex');
}

// GET /api/obituaries/:slug/condolences — list approved condolences
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const obit = await obituaryRepo.getBySlug(slug);
  if (!obit) {
    return NextResponse.json({ error: 'Nie znaleziono nekrologu' }, { status: 404 });
  }
  const items = condolenceStore.listForSlug(slug);
  return NextResponse.json({ items, count: items.length });
}

// POST /api/obituaries/:slug/condolences — add a condolence
export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const obit = await obituaryRepo.getBySlug(slug);
  if (!obit) {
    return NextResponse.json({ error: 'Nie znaleziono nekrologu' }, { status: 404 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowe dane' }, { status: 400 });
  }

  const authorName = String(body?.authorName || '').trim();
  const text = String(body?.text || '').trim();
  const relation = body?.relation ? String(body.relation).trim() : undefined;

  if (authorName.length < 2 || authorName.length > 80) {
    return NextResponse.json(
      { error: 'Imię i nazwisko musi mieć od 2 do 80 znaków' },
      { status: 400 },
    );
  }
  if (text.length < 8 || text.length > 1000) {
    return NextResponse.json(
      { error: 'Treść kondolencji musi mieć od 8 do 1000 znaków' },
      { status: 400 },
    );
  }

  const ipHash = hashIp(req);
  const result = condolenceStore.add({
    obituarySlug: slug,
    authorName,
    text,
    relation,
    ipHash,
  });

  if (result.ok === false) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 429 });
  }

  // Strip internal fields before returning
  const { id, obituaryId, authorName: an, text: t, relation: r, status, createdAt } = result.condolence;
  return NextResponse.json({
    ok: true,
    pending: status === 'pending',
    condolence: { id, obituaryId, authorName: an, text: t, relation: r, status, createdAt },
  });
}
