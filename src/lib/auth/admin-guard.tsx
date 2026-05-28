import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { getServerUser, AUTH_CONFIGURED } from './session';

/**
 * Server-side admin guard.
 *
 * Returns:
 *  - { allowed: true, demo: true, user: null }  → auth not configured (dev/demo mode — render normally)
 *  - { allowed: true, demo: false, user: ... } → real admin
 *  - { allowed: false, ...node }               → render the returned <Forbidden /> JSX in page
 */
export type AdminAccess =
  | { allowed: true; demo: boolean; user: any | null; node?: undefined }
  | { allowed: false; demo?: undefined; user?: undefined; node: React.ReactElement };

export async function checkAdminAccess(): Promise<AdminAccess> {
  if (!AUTH_CONFIGURED) {
    return { allowed: true, demo: true, user: null } as const;
  }
  const user = await getServerUser();
  if (user?.role === 'admin') {
    return { allowed: true, demo: false, user } as const;
  }
  return { allowed: false, node: <Forbidden user={user} /> } as const;
}

export function Forbidden({ user }: { user?: { email?: string; role?: string } | null }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 bg-stone-50">
      <div className="bg-white border border-stone-200 rounded-2xl p-8 max-w-md text-center shadow-sm">
        <ShieldAlert className="w-10 h-10 mx-auto text-red-500" />
        <h1
          className="mt-3 text-xl font-medium text-stone-900"
          style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
        >
          Brak uprawnień
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Panel administratora wymaga konta z rolą <code className="px-1 py-0.5 bg-stone-100 rounded">admin</code>.
        </p>
        {user?.email && (
          <p className="mt-2 text-xs text-stone-400">
            Zalogowano jako {user.email} ({user.role || 'family'})
          </p>
        )}
        <div className="mt-5 flex gap-2 justify-center">
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-[#2E4F3E] text-white text-sm font-medium hover:bg-[#26412F]"
          >
            Strona główna
          </Link>
          <Link
            href="/logowanie"
            className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 text-sm hover:border-stone-500"
          >
            Zaloguj inaczej
          </Link>
        </div>
      </div>
    </div>
  );
}
