"use client";

import { useFormState, useFormStatus } from "react-dom";
import { bulkApplyVehicleBudgetPolicyAction, type PolicyActionState } from "./actions";
import type { FiscalYearOption, SimpleOption } from "@/repositories/masterDataRepository";

const initialState: PolicyActionState = { error: null };
const inputClass = "w-full rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Menerapkan..." : "Terapkan ke Semua Kendaraan di Kategori Ini"}
    </button>
  );
}

export function BulkPolicyForm({ categories, fiscalYears }: { categories: SimpleOption[]; fiscalYears: FiscalYearOption[] }) {
  const [state, formAction] = useFormState(bulkApplyVehicleBudgetPolicyAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md border border-status-danger/30 bg-status-dangerBg px-4 py-3 text-sm text-status-danger">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-md border border-status-success/30 bg-status-successBg px-4 py-3 text-sm text-status-success">
          {state.success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Kategori Kendaraan</label>
          <select name="vehicle_category_id" className={inputClass} required defaultValue="">
            <option value="" disabled>
              Pilih kategori
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Tahun Anggaran</label>
          <select name="fiscal_year_id" className={inputClass} required defaultValue="">
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
          <label className="mb-1 block text-sm font-medium text-slate-700">Jatah BBM per Bulan (Rp)</label>
          <input name="monthly_fuel_allocation" type="number" min="0" className={inputClass} placeholder="Contoh: 200000" required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Alokasi Pemeliharaan per Tahun (Rp)</label>
          <input name="annual_maintenance_allocation" type="number" min="0" className={inputClass} placeholder="Contoh: 1050000" required />
        </div>
      </div>

      <p className="rounded-md bg-surface-muted px-3 py-2 text-xs text-slate-500">
        Contoh: motor dinas Rp3.450.000/tahun dengan jatah BBM Rp200.000/bulan (Rp2.400.000/tahun) →
        sisanya Rp1.050.000/tahun untuk pemeliharaan. Isi kedua kolom terpisah, sistem menjumlahkan
        otomatis menjadi pagu tahunan.
      </p>

      <SubmitButton />
    </form>
  );
}
