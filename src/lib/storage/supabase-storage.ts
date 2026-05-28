/**
 * Supabase Storage helper.
 *
 * Buckety:
 *  - avatars       — awatary userów (publiczne)
 *  - companies     — logo + galeria firm (publiczne)
 *  - obituaries    — zdjęcia w nekrologach (publiczne)
 *  - docs          — dokumenty weryfikacyjne firm (PRYWATNE, signed URL)
 *
 * Bezpieczeństwo:
 *  - MIME whitelist: image/jpeg, image/png, image/webp, image/avif (oraz application/pdf dla docs)
 *  - Max size 5 MB (10 MB dla docs)
 *  - Nazwa pliku sanityzowana (UUID + ext)
 *  - Walidacja "magic bytes" (sygnatury pliku) — broni przed wgraniem skryptu z .jpg
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const BUCKETS = {
  avatars: process.env.SUPABASE_STORAGE_BUCKET_AVATARS || 'avatars',
  companies: process.env.SUPABASE_STORAGE_BUCKET_COMPANIES || 'companies',
  obituaries: process.env.SUPABASE_STORAGE_BUCKET_OBITUARIES || 'obituaries',
  docs: process.env.SUPABASE_STORAGE_BUCKET_DOCS || 'docs',
} as const;

export type BucketName = keyof typeof BUCKETS;

const MIME_IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MIME_DOC = ['application/pdf', ...MIME_IMAGE];

const MAX_SIZE_IMAGE = 5 * 1024 * 1024; // 5 MB
const MAX_SIZE_DOC = 10 * 1024 * 1024; // 10 MB

const MAGIC_BYTES: Array<{ mime: string; signatures: number[][] }> = [
  { mime: 'image/jpeg', signatures: [[0xff, 0xd8, 0xff]] },
  { mime: 'image/png', signatures: [[0x89, 0x50, 0x4e, 0x47]] },
  { mime: 'image/webp', signatures: [[0x52, 0x49, 0x46, 0x46]] }, // RIFF
  { mime: 'application/pdf', signatures: [[0x25, 0x50, 0x44, 0x46]] }, // %PDF
];

function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase Storage niedostępny — brak NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const isStorageEnabled = (): boolean =>
  Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY);

/* ────────────────────────────────────────────────────────────────────────── */
/*  Validation                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

function checkMagicBytes(buffer: ArrayBuffer, declaredMime: string): boolean {
  const view = new Uint8Array(buffer.slice(0, 16));
  const entry = MAGIC_BYTES.find((m) => m.mime === declaredMime);
  if (!entry) return true; // brak sygnatury w bazie — przyjmij
  return entry.signatures.some((sig) => sig.every((b, i) => view[i] === b));
}

function sanitizeFilename(name: string): string {
  const ext = (name.match(/\.([a-zA-Z0-9]{1,5})$/)?.[1] || 'bin').toLowerCase();
  const uuid =
    typeof crypto !== 'undefined' && (crypto as any).randomUUID
      ? (crypto as any).randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `${uuid}.${ext}`;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Upload                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

export type UploadResult =
  | { ok: true; path: string; publicUrl?: string; signedUrl?: string; error?: undefined }
  | { ok: false; error: string; path?: undefined; publicUrl?: undefined; signedUrl?: undefined };

export async function uploadFile(opts: {
  bucket: BucketName;
  file: File | Blob;
  filename?: string;
  folder?: string;
  /** Generuj signed URL z czasem ważności (sekundy). Dla bucketów prywatnych. */
  signedUrlSeconds?: number;
}): Promise<UploadResult> {
  if (!isStorageEnabled()) {
    return { ok: false, error: 'Storage niedostępny (demo mode)' };
  }
  const { bucket, file, folder } = opts;
  const isDocBucket = bucket === 'docs';
  const allowedMime = isDocBucket ? MIME_DOC : MIME_IMAGE;
  const maxSize = isDocBucket ? MAX_SIZE_DOC : MAX_SIZE_IMAGE;

  const declaredMime = (file as File).type || 'application/octet-stream';
  if (!allowedMime.includes(declaredMime)) {
    return { ok: false, error: `Niedozwolony typ pliku: ${declaredMime}` };
  }
  if (file.size > maxSize) {
    return { ok: false, error: `Plik za duży (max ${Math.round(maxSize / 1024 / 1024)} MB)` };
  }

  // Magic bytes
  const buf = await (file as Blob).arrayBuffer();
  if (!checkMagicBytes(buf, declaredMime)) {
    return { ok: false, error: 'Zawartość pliku nie zgadza się z deklarowanym typem' };
  }

  const filename = sanitizeFilename(opts.filename || (file as File).name || 'upload');
  const path = folder ? `${folder.replace(/^\/+|\/+$/g, '')}/${filename}` : filename;

  try {
    const client = getAdminClient();
    const { error } = await client.storage.from(BUCKETS[bucket]).upload(path, buf, {
      contentType: declaredMime,
      cacheControl: '3600',
      upsert: false,
    });
    if (error) return { ok: false, error: error.message };

    // URL: publiczny lub signed
    if (isDocBucket || opts.signedUrlSeconds) {
      const { data, error: signErr } = await client.storage
        .from(BUCKETS[bucket])
        .createSignedUrl(path, opts.signedUrlSeconds || 3600);
      if (signErr) return { ok: false, error: signErr.message };
      return { ok: true, path, signedUrl: data?.signedUrl };
    }
    const { data } = client.storage.from(BUCKETS[bucket]).getPublicUrl(path);
    return { ok: true, path, publicUrl: data?.publicUrl };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Upload failed' };
  }
}

export async function deleteFile(bucket: BucketName, path: string): Promise<{ ok: boolean; error?: string }> {
  if (!isStorageEnabled()) return { ok: false, error: 'Storage niedostępny' };
  try {
    const client = getAdminClient();
    const { error } = await client.storage.from(BUCKETS[bucket]).remove([path]);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message };
  }
}

export async function getSignedUrl(
  bucket: BucketName,
  path: string,
  expiresIn = 3600
): Promise<{ url?: string; error?: string }> {
  if (!isStorageEnabled()) return { error: 'Storage niedostępny' };
  try {
    const client = getAdminClient();
    const { data, error } = await client.storage.from(BUCKETS[bucket]).createSignedUrl(path, expiresIn);
    if (error) return { error: error.message };
    return { url: data?.signedUrl };
  } catch (e: any) {
    return { error: e?.message };
  }
}
