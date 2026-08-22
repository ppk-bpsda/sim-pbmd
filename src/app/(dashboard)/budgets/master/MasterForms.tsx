"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useTransition } from "react";
import {
  createBudgetAccountAction,
  createFiscalYearAction,
  setActiveFiscalYearAction,
  createProgramAction,
  createActivityAction,
  createSubactivityAction,
  type MasterActionState,
} from "./actions";
import type { SimpleOption, ActivityOption } from "@/repositories/masterDataRepository";

const initialState: MasterActionState = { error: null };
const inputClass = "w-full rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
      {pending ? "Menyimpan..." : label}
    </button>
  );
}

export function BudgetAccountForm() {
  const [state, formAction] = useFormState(createBudgetAccountAction, initialState);
  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input name="code" placeholder="Kode rekening (mis. 5.1.02.02.05)" className={inputClass} required />
        <input name="name" placeholder="Nama rekening" className={`${inputClass} sm:col-span-2`} required />
      </div>
      {state.error && <p className="text-sm text-status-danger">{state.error}</p>}
      <SubmitButton label="Tambah Rekening" />
    </form>
  );
}

export function FiscalYearForm() {
  const [state, formAction] = useFormState(createFiscalYearAction, initialState);
  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input name="year" type="number" placeholder="Tahun (mis. 2027)" className={inputClass} required />
      </div>
      {state.error && <p className="text-sm text-status-danger">{state.error}</p>}
      <SubmitButton label="Tambah Tahun Anggaran" />
    </form>
  );
}

export function FiscalYearActivateButton({ fiscalYearId, isActive }: { fiscalYearId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();
  if (isActive) {
    return <span className="rounded-full bg-status-successBg px-2 py-0.5 text-[11px] font-medium text-status-success">Berjalan</span>;
  }
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => setActiveFiscalYearAction(fiscalYearId))}
      className="text-xs text-brand-700 hover:underline disabled:opacity-50"
    >
      Jadikan Tahun Berjalan
    </button>
  );
}

export function ProgramForm() {
  const [state, formAction] = useFormState(createProgramAction, initialState);
  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input name="code" placeholder="Kode program" className={inputClass} required />
        <input name="name" placeholder="Nama program" className={`${inputClass} sm:col-span-2`} required />
      </div>
      {state.error && <p className="text-sm text-status-danger">{state.error}</p>}
      <SubmitButton label="Tambah Program" />
    </form>
  );
}

export function ActivityForm({ programs }: { programs: SimpleOption[] }) {
  const [state, formAction] = useFormState(createActivityAction, initialState);
  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select name="program_id" className={inputClass} required defaultValue="">
          <option value="" disabled>
            Pilih program induk
          </option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input name="code" placeholder="Kode kegiatan" className={inputClass} required />
        <input name="name" placeholder="Nama kegiatan" className={inputClass} required />
      </div>
      {state.error && <p className="text-sm text-status-danger">{state.error}</p>}
      <SubmitButton label="Tambah Kegiatan" />
    </form>
  );
}

export function SubactivityForm({ activities }: { activities: ActivityOption[] }) {
  const [state, formAction] = useFormState(createSubactivityAction, initialState);
  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select name="activity_id" className={inputClass} required defaultValue="">
          <option value="" disabled>
            Pilih kegiatan induk
          </option>
          {activities.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <input name="code" placeholder="Kode sub kegiatan" className={inputClass} required />
        <input name="name" placeholder="Nama sub kegiatan" className={inputClass} required />
      </div>
      {state.error && <p className="text-sm text-status-danger">{state.error}</p>}
      <SubmitButton label="Tambah Sub Kegiatan" />
    </form>
  );
}
