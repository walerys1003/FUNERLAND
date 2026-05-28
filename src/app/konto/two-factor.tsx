'use client';

import { useEffect, useState } from 'react';
import { Loader2, Shield, ShieldCheck, ShieldOff, CheckCircle2, KeyRound, Copy, Check } from 'lucide-react';

type Factor = { id: string; friendlyName?: string; status: string; createdAt?: string };
type Status = { mode: 'demo' | 'real'; enabled: boolean; factors: Factor[] };

export default function TwoFactor() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'idle' | 'enrolling' | 'verifying' | 'done'>('idle');
  const [enroll, setEnroll] = useState<{ factorId: string; secret: string; uri: string; qr?: string | null } | null>(null);
  const [code, setCode] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function loadStatus() {
    setLoading(true);
    try {
      const res = await fetch('/api/account/2fa/status');
      const data = await res.json();
      if (res.ok) setStatus(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function startEnroll() {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch('/api/account/2fa/enroll', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'enroll failed');
      setEnroll({ factorId: data.factorId, secret: data.secret, uri: data.uri, qr: data.qr });
      setStep('enrolling');
    } catch (e: any) {
      setErr(e?.message || 'Błąd');
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    if (!enroll) return;
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch('/api/account/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factorId: enroll.factorId, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'verify failed');
      setStep('done');
      setEnroll(null);
      setCode('');
      await loadStatus();
    } catch (e: any) {
      setErr(e?.message || 'Nieprawidłowy kod');
    } finally {
      setBusy(false);
    }
  }

  async function disable(factorId: string) {
    if (!confirm('Wyłączyć 2FA? Konto będzie chronione tylko hasłem / magic linkiem.')) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/api/account/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factorId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'disable failed');
      await loadStatus();
    } catch (e: any) {
      setErr(e?.message || 'Błąd');
    } finally {
      setBusy(false);
    }
  }

  function copySecret() {
    if (!enroll?.secret) return;
    navigator.clipboard.writeText(enroll.secret).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <div className="mt-3 text-[13px] text-text-secondary inline-flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Ładowanie statusu 2FA…
      </div>
    );
  }

  const enabled = status?.enabled;
  const isDemo = status?.mode === 'demo';

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <h4 className="font-medium text-navy text-[14px] inline-flex items-center gap-1.5">
            {enabled ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            ) : (
              <Shield className="w-4 h-4 text-text-muted" />
            )}
            Uwierzytelnianie dwuskładnikowe (2FA){' '}
            {enabled && (
              <span className="text-[10.5px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                aktywne
              </span>
            )}
            {isDemo && (
              <span className="text-[10.5px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                demo
              </span>
            )}
          </h4>
          <p className="text-[12.5px] text-text-secondary mt-0.5">
            Generator kodów (Google Authenticator, 1Password, Authy). Wymagany jednorazowy kod 6-cyfrowy
            przy każdym logowaniu.
          </p>
        </div>
        {step === 'idle' && !enabled && (
          <button
            type="button"
            onClick={startEnroll}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:opacity-90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            Włącz 2FA
          </button>
        )}
      </div>

      {/* Active factors */}
      {enabled && status && (
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3 space-y-2">
          {status.factors
            .filter((f) => f.status === 'verified')
            .map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-[13px] text-emerald-900">
                  <span className="font-medium">{f.friendlyName || 'TOTP authenticator'}</span>
                  <span className="ml-2 text-emerald-700/70 text-[11.5px]">
                    {f.createdAt ? `od ${new Date(f.createdAt).toLocaleDateString('pl-PL')}` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => disable(f.id)}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 text-red-700 text-[12.5px] hover:bg-red-50 disabled:opacity-60"
                >
                  <ShieldOff className="w-3.5 h-3.5" />
                  Wyłącz
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Enroll flow */}
      {step === 'enrolling' && enroll && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
          <h5 className="font-medium text-navy text-[14px]">Krok 1 — zeskanuj kod</h5>
          <p className="text-[12.5px] text-text-secondary">
            Otwórz aplikację Google Authenticator / 1Password / Authy i zeskanuj poniższy kod QR. Możesz też
            wprowadzić sekret ręcznie.
          </p>

          <div className="flex items-start gap-4 flex-wrap">
            <div className="bg-white rounded-lg border border-stone-200 p-2 flex-shrink-0">
              {enroll.qr ? (
                // Supabase returns SVG data URI; render via <img>.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={enroll.qr} alt="Kod QR do parowania 2FA" width={160} height={160} />
              ) : (
                <QrFallback uri={enroll.uri} />
              )}
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11.5px] text-text-secondary mb-1">Sekret (ręczne wprowadzenie)</label>
              <div className="flex items-center gap-2">
                <code className="block flex-1 px-3 py-2 bg-white border border-stone-300 rounded-lg text-[12.5px] font-mono break-all">
                  {enroll.secret}
                </code>
                <button
                  type="button"
                  onClick={copySecret}
                  className="px-3 py-2 rounded-lg border border-stone-300 hover:bg-white text-stone-700 inline-flex items-center gap-1.5 text-[12.5px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Skopiowano' : 'Kopiuj'}
                </button>
              </div>
            </div>
          </div>

          <h5 className="font-medium text-navy text-[14px] mt-3">Krok 2 — potwierdź kodem 6-cyfrowym</h5>
          <div className="flex gap-2 flex-wrap items-center">
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="px-3 py-2 rounded-lg border border-stone-300 text-sm font-mono tracking-[0.3em] text-center w-36 focus:outline-none focus:border-navy"
              autoFocus
            />
            <button
              type="button"
              onClick={verifyCode}
              disabled={busy || code.length !== 6}
              className="px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Potwierdź
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('idle');
                setEnroll(null);
                setCode('');
                setErr(null);
              }}
              className="px-3 py-2 text-sm text-text-secondary hover:text-navy"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[13px] text-emerald-800 inline-flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          2FA zostało włączone. Przy następnym logowaniu zostaniesz poproszony o kod.
        </div>
      )}

      {err && (
        <div className="text-[12.5px] bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2">
          {err}
        </div>
      )}
    </div>
  );
}

/** Tiny fallback when Supabase doesn't provide QR (e.g. demo mode) — show the URI as text instructions. */
function QrFallback({ uri }: { uri: string }) {
  return (
    <div className="w-[160px] h-[160px] flex items-center justify-center bg-stone-100 rounded text-[10px] text-text-muted text-center p-2 break-all">
      {uri.slice(0, 60)}…
    </div>
  );
}
