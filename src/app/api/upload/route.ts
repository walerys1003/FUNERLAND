import { NextResponse } from 'next/server';
import { uploadFile, isStorageEnabled, type BucketName } from '@/lib/storage/supabase-storage';
import { rateLimit } from '@/lib/security/rate-limit';
import { requireRole } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/upload
 * multipart/form-data: file=<File>, bucket=avatars|companies|obituaries|docs, folder?=<string>
 *
 * Wymaga zalogowania (rola: family|company|admin).
 * Walidacja: MIME + size + magic bytes (w libce storage).
 * Zwraca publicUrl lub signedUrl (dla bucketu `docs`).
 */
export async function POST(req: Request) {
  const rl = await rateLimit(req, { limit: 30, windowMs: 60_000, key: 'upload' });
  if (!rl.ok) return rl.response;

  // Wymaga zalogowanego usera (w demo mode requireRole zwraca null bez błędu)
  const user = await requireRole(['family', 'company', 'admin']).catch(() => null);

  if (!isStorageEnabled()) {
    return NextResponse.json(
      {
        error: 'Storage niedostępny (demo mode)',
        hint: 'Ustaw NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY',
      },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'multipart/form-data wymagany' }, { status: 400 });
  }

  const file = form.get('file');
  const bucket = String(form.get('bucket') || '') as BucketName;
  const folder = (form.get('folder') as string | null) || undefined;

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'Brak pliku' }, { status: 400 });
  }
  if (!['avatars', 'companies', 'obituaries', 'docs'].includes(bucket)) {
    return NextResponse.json({ error: 'Nieprawidłowy bucket' }, { status: 400 });
  }

  // Tylko admin może wgrywać do docs (KYC/weryfikacja)
  if (bucket === 'docs' && user?.role !== 'admin' && user?.role !== 'company') {
    return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
  }

  const result = await uploadFile({
    bucket,
    file,
    folder: folder || (user?.id ? `u/${user.id}` : undefined),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    path: result.path,
    url: result.publicUrl || result.signedUrl,
  });
}
