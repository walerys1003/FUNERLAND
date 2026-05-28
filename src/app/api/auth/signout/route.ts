import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // best-effort
  }
  const { origin } = new URL(req.url);
  return NextResponse.redirect(`${origin}/`, { status: 303 });
}

// Allow GET so logout link works without form
export async function GET(req: Request) {
  return POST(req);
}
