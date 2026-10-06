"use client";

import { useEffect, useState } from "react";

export default function ConfirmModal({
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={() => !busy && onClose()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-title" className="text-lg font-semibold">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted">{message}</p>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            autoFocus
            className="flex-1 rounded-lg border border-border px-4 py-2.5 font-medium transition hover:border-accent"
          >
            Cancelar
          </button>
          <button
            onClick={confirm}
            disabled={busy}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {busy ? "Eliminando…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
