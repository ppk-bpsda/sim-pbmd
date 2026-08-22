"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveBudgetAction, type BudgetActionState } from "./actions";
import type { FiscalYearOption, SimpleOption, UnitOption } from "@/repositories/masterDataRepository";

const initialState: BudgetActionState = { error: null };
const inputClass = "w-full rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Menyimpan..." : label}
    </button>
  );
}

export type BudgetFormInitialValues = {
  id?: string;
  fiscal_year_id?: string;
  budget_account_id?: string;
  unit_id?: string;
  ceiling_amount?: number;
  notes?: string | null;
};

export function BudgetForm({
  fiscalYears,
  units,
  budgetAccounts,
  initialValues,
}: {
  fiscalYears: FiscalYearOption[];
  units: UnitOption[];
  budgetAccounts: SimpleOption[];
  initialValues?: BudgetFormInitialValues;
}) {
  const [state, formAction] = useFormState(saveBudgetAction, initialState);
  const isEdit = Boolean(initialValues?.id);

  return (
    <form action={formAction} className="space-y-4">
      {initialValues?.id && <input type="hidden" name="id" value={initialValues.id} />}

      {state.error && (
        <div className="rounded-md border border-status-danger/30 bg-status-dangerBg px-4 py-3 text-sm text-status-danger">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Tahun Anggaran *</label>
          <select name="fiscal_year_id" defaultValue={initialValues?.fiscal_year_id ?? ""} className={inputClass} required>
            <option value="" disabled>
              Pilih tahun anggaran
            </option>
            {fiscalYears.map((f) => (
              <option key={f.id} value={f.id}>
                {f.year}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Rekening Belanja *</label>
          <select name="budget_account_id" defaultValue={initialValues?.budget_account_id ?? ""} className={inputClass} required>
            <option value="" disabled>
              Pilih rekening belanja
            </option>
            {budgetAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} — {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Unit Kerja *</label>
          <select name="unit_id" defaultValue={initialValues?.unit_id ?? ""} className={inputClass} required>
            <option value="" disabled>
              Pilih unit kerja
            </option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Pagu (Rp) *</label>
          <input name="ceiling_amount" type="number" min="0" defaultValue={initialValues?.ceiling_amount ?? ""} className={inputClass} required />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Keterangan</label>
        <textarea name="notes" rows={2} defaultValue={initialValues?.notes ?? ""} className={inputClass} />
      </div>

      <div className="border-t border-surface-border pt-4">
        <SubmitButton label={isEdit ? "Simpan Perubahan" : "Simpan Pagu"} />
      </div>
    </form>
  );
}
