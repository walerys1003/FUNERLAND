'use client';

import { useState } from 'react';
import { Download, Trash2, Loader2, AlertTriangle } from 'lucide-react';

export default function AccountActions({ email }: { email: string }) {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function exportData() {
    setExporting(true);
    setExportError(null);
    try {
      const res = await fetch('/api/account/export', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Eksport nie powiódł się (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const stamp = new Date().toISOString().slice(0, 10);
      a.download = `polskiepogrzeby-export-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setExportError(e?.message || 'Błąd');
    } finally {
      setExporting(false);
    }
  }

  async function deleteAccount() {
    if (confirmText !== email) {
      setDeleteError('Wpisz dokładnie swój e-mail aby potwierdzić.');
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmEmail: confirmText }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Usunięcie nie powiodło się (${res.status})`);
      // Sign out + redirect
      window.location.href = '/?account_deleted=1';
    } catch (e: any) {
      setDeleteError(e?.message || 'Błąd');
      setDeleting(false);
    }
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Export */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <h4 className="font-medium text-navy text-[14px]">Eksport moich danych</h4>
          <p className="text-[12.5px] text-text-secondary mt-0.5">
            Pobierz plik JSON ze wszystkimi twoimi danymi z platformy: profil, rezerwacje, leady, opinie, nekrologi.
          </p>
        </div>
        <button
          type="button"
          onClick={exportData}
          disabled={exporting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:opacity-90 disabled:opacity-60"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Pobierz JSON
        </button>
      </div>
      {exportError && (
        <div className="text-[12.5px] bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2">
          {exportError}
        </div>
      )}

      <hr className="border-stone-200" />

      {/* Delete */}
      <div>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-[240px]">
            <h4 className="font-medium text-red-700 text-[14px] inline-flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Usuń konto
            </h4>
            <p className="text-[12.5px] text-text-secondary mt-0.5">
              Operacja nieodwracalna. Dane osobowe zostaną usunięte / zanonimizowane. Treści publiczne
              (opinie, nekrologi) zostaną oznaczone jako anonimowe lub usunięte zgodnie z polityką.
            </p>
          </div>
          {!deleteConfirm && (
            <button
              type="button"
              onClick={() => setDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-700 text-sm font-medium hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Chcę usunąć konto
            </button>
          )}
        </div>

        {deleteConfirm && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-[13px] text-red-800 font-medium">
              Aby potwierdzić, wpisz swój e-mail (<span className="font-mono">{email}</span>) poniżej:
            </p>
            <input
              type="email"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="email@example.com"
              className="mt-2 w-full px-3 py-2 rounded-lg border border-red-300 bg-white text-sm focus:outline-none focus:border-red-500"
            />
            {deleteError && (
              <div className="mt-2 text-[12.5px] text-red-700">{deleteError}</div>
            )}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={deleteAccount}
                disabled={deleting || confirmText !== email}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Usuń bezpowrotnie
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirm(false);
                  setConfirmText('');
                  setDeleteError(null);
                }}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-stone-300 text-sm hover:bg-white"
              >
                Anuluj
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
