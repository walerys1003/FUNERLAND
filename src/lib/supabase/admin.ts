// Service-role client (bypasses RLS) — używać TYLKO w API routes / cron
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
