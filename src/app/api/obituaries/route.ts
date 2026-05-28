import { NextResponse } from 'next/server';
import { obituaryRepo } from '@/lib/marketplace/repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/obituaries?city=Warszawa&tier=premium
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city') || undefined;
  const tier = (searchParams.get('tier') as 'free' | 'premium' | null) || undefined;
  const list = await obituaryRepo.list({ city, tier });
  return NextResponse.json({ count: list.length, items: list });
}

// POST /api/obituaries — publish
export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.personName || !data.deathDate || !data.text || !data.authorName || !data.authorEmail || !data.city) {
      return NextResponse.json(
        { error: 'Wymagane: personName, deathDate, text, authorName, authorEmail, city' },
        { status: 400 },
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.authorEmail)) {
      return NextResponse.json({ error: 'Nieprawidłowy e-mail' }, { status: 400 });
    }
    if (data.text.length < 20 || data.text.length > 4000) {
      return NextResponse.json({ error: 'Treść musi mieć 20–4000 znaków' }, { status: 400 });
    }
    if (!data.rodo) {
      return NextResponse.json({ error: 'Wymagana zgoda RODO' }, { status: 400 });
    }
    const obit = await obituaryRepo.publish({
      personName: String(data.personName).slice(0, 120),
      birthDate: data.birthDate,
      deathDate: data.deathDate,
      city: String(data.city).slice(0, 80),
      funeralDate: data.funeralDate,
      funeralPlace: data.funeralPlace,
      text: String(data.text).slice(0, 4000),
      authorName: String(data.authorName).slice(0, 120),
      authorEmail: data.authorEmail,
      photoUrl: data.photoUrl,
      tier: data.tier === 'premium' ? 'premium' : 'free',
    });
    return NextResponse.json({ ok: true, obituary: obit });
  } catch (e: any) {
    console.error('Obituary error:', e);
    return NextResponse.json({ error: 'Wystąpił błąd' }, { status: 500 });
  }
}
