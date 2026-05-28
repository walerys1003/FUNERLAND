/**
 * Server-side helpers for reading the current user/profile from Supabase.
 * All functions are SAFE to call when Supabase env vars are missing — they return null.
 */

import { createClient } from '@/lib/supabase/server';

export type SessionUser = {
  id: string;
  email: string;
  role: 'family' | 'company' | 'admin';
  fullName?: string;
  phone?: string;
  city?: string;
  avatarUrl?: string;
};

const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export async function getServerUser(): Promise<SessionUser | null> {
  if (!SUPABASE_CONFIGURED) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, phone, city, avatar_url')
      .eq('id', user.id)
      .maybeSingle();
    return {
      id: user.id,
      email: user.email || '',
      role: (profile?.role as any) || 'family',
      fullName: profile?.full_name || undefined,
      phone: profile?.phone || undefined,
      city: profile?.city || undefined,
      avatarUrl: profile?.avatar_url || undefined,
    };
  } catch {
    return null;
  }
}

export async function requireRole(roles: SessionUser['role'][]): Promise<SessionUser | null> {
  const u = await getServerUser();
  if (!u) return null;
  if (!roles.includes(u.role)) return null;
  return u;
}

/** Get all companies the current user manages. */
export async function getUserCompanies(): Promise<{ id: string; slug: string; name: string }[]> {
  if (!SUPABASE_CONFIGURED) return [];
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from('company_members')
      .select('companies(id, slug, name)')
      .eq('user_id', user.id);
    return (data || []).map((r: any) => r.companies).filter(Boolean);
  } catch {
    return [];
  }
}

export const AUTH_CONFIGURED = SUPABASE_CONFIGURED;
