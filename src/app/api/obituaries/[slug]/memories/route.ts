import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { memoryStore } from '@/lib/marketplace/store';
import { obituaryRepo } from '@/lib/marketplace/repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function hashIp(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return createHash('sha256').update(ip + (process.env.SALT || 'pp')).digest('hex');
}

// GET /api/obituaries/:slug/memories — list approved memories (photos + stories)
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const obit = await obituaryRepo.getBySlug(slug);
  if (!obit) {
    return NextResponse.json({ error: 'Nie znaleziono nekrologu' }, { status: 404 });
  }
  const items = memoryStore.listForSlug(slug);
  return NextResponse.json({ items, count: items.length });
}

// POST /api/obituaries/:slug/memories — add memory (photo URL or story)
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

  const type = body?.type === 'photo' ? 'photo' : 'story';
  const title = String(body?.title || '').trim();
  const description = body?.description ? String(body.description).trim() : undefined;
  const imageUrl = body?.imageUrl ? String(body.imageUrl).trim() : undefined;
  const authorName = String(body?.authorName || '').trim();

  if (authorName.length < 2 || authorName.length > 80) {
    return NextResponse.json(
      { error: 'Imię i nazwisko musi mieć od 2 do 80 znaków' },
      { status: 400 },
    );
  }
  if (title.length < 2 || title.length > 120) {
    return NextResponse.json(
      { error: 'Tytuł musi mieć od 2 do 120 znaków' },
      { status: 400 },
    );
  }
  if (type === 'photo') {
    if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
      return NextResponse.json(
        { error: 'Podaj prawidłowy adres URL zdjęcia (http/https)' },
        { status: 400 },
      );
    }
  } else {
    if (!description || description.length < 20) {
      return NextResponse.json(
        { error: 'Historia musi mieć co najmniej 20 znaków' },
        { status: 400 },
      );
    }
  }

  const ipHash = hashIp(req);
  const result = memoryStore.add({
    obituarySlug: slug,
    type,
    title,
    description,
    imageUrl,
    authorName,
    ipHash,
  });

  if (result.ok === false) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    pending: true,
    memory: {
      id: result.memory.id,
      type: result.memory.type,
      title: result.memory.title,
      description: result.memory.description,
      imageUrl: result.memory.imageUrl,
      authorName: result.memory.authorName,
      status: result.memory.status,
      createdAt: result.memory.createdAt,
    },
  });
}
