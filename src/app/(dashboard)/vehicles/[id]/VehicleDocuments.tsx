"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { addVehicleDocumentAction, deleteVehicleDocumentAction, type DocumentActionState } from "../actions";
import { VEHICLE_DOCUMENT_TYPES, documentTypeLabel, daysUntil } from "@/constants/vehicle";
import { formatDate } from "@/lib/format";
import type { VehicleDocumentRow } from "@/repositories/vehicleRepository";

const initialState: DocumentActionState = { error: null };
const inputClass = "w-full rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Menyimpan..." : "Tambah Dokumen"}
    </button>
  );
}

function DueBadge({ expiryDate, reminderDays }: { expiryDate: string | null; reminderDays: number }) {
  const days = daysUntil(expiryDate);
  if (days === null) return null;
  if (days < 0) {
    return <span className="rounded-full bg-status-dangerBg px-2 py-0.5 text-[11px] font-medium text-status-danger">Sudah lewat {Math.abs(days)} hari</span>;
  }
  if (days <= reminderDays) {
    return <span className="rounded-full bg-status-warningBg px-2 py-0.5 text-[11px] font-medium text-status-warning">{days} hari lagi</span>;
  }
  return <span className="rounded-full bg-status-successBg px-2 py-0.5 text-[11px] font-medium text-status-success">Berlaku</span>;
}

function DeleteButton({ vehicleId, documentId }: { vehicleId: string; documentId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => deleteVehicleDocumentAction(vehicleId, documentId))}
      className="rounded-md p-1.5 text-slate-400 hover:bg-status-dangerBg hover:text-status-danger disabled:opacity-50"
      aria-label="Hapus dokumen"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

export function VehicleDocuments({ vehicleId, documents }: { vehicleId: string; documents: VehicleDocumentRow[] }) {
  const boundAction = addVehicleDocumentAction.bind(null, vehicleId);
  const [state, formAction] = useFormState(boundAction, initialState);

  return (
    <div className="rounded-card border border-surface-border bg-white shadow-card">
      <h2 className="border-b border-surface-border px-5 py-3 text-sm font-semibold text-slate-700">
        Dokumen Kendaraan (STNK / Pajak / KIR)
      </h2>

      <ul className="divide-y divide-surface-border">
        {documents.length === 0 && (
          <li className="px-5 py-6 text-center text-sm text-slate-400">Belum ada dokumen tercatat.</li>
        )}
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center justify-between gap-3 px-5 py-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-700">{documentTypeLabel(doc.document_type)}</p>
                <DueBadge expiryDate={doc.expiry_date} reminderDays={doc.reminder_days_before} />
              </div>
              <p className="text-xs text-slate-400">
                {doc.document_number ?? "-"} — Berlaku s.d. {formatDate(doc.expiry_date)}
              </p>
            </div>
            <DeleteButton vehicleId={vehicleId} documentId={doc.id} />
          </li>
        ))}
      </ul>

      <form action={formAction} className="space-y-3 border-t border-surface-border p-5">
        {state.error && <p className="text-sm text-status-danger">{state.error}</p>}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select name="document_type" className={inputClass} defaultValue="STNK" required>
            {VEHICLE_DOCUMENT_TYPES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <input name="document_number" placeholder="Nomor dokumen" className={inputClass} />
          <div>
            <label className="mb-1 block text-xs text-slate-500">Tanggal Terbit</label>
            <input name="issued_date" type="date" className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Tanggal Jatuh Tempo</label>
            <input name="expiry_date" type="date" className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Ingatkan (hari sebelum jatuh tempo)</label>
            <input name="reminder_days_before" type="number" defaultValue={30} className={inputClass} />
          </div>
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}
