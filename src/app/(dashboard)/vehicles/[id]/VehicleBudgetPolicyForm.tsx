"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveVehicleBudgetPolicyAction, type PolicyActionState } from "../policies/actions";
import type { FiscalYearOption } from "@/repositories/masterDataRepository";

const initialState: PolicyActionState = { error: null };
const inputClass = "w-full rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Menyimpan..." : "Simpan Alokasi"}
    </button>
  );
}

export function VehicleBudgetPolicyForm({
  vehicleId,
  fiscalYears,
  currentFiscalYearId,
  currentMonthlyFuel,
  currentAnnualMaintenance,
}: {
  vehicleId: string;
  fiscalYears: FiscalYearOption[];
  currentFiscalYearId?: string;
  currentMonthlyFuel?: number | null;
  currentAnnualMaintenance?: number | null;
}) {
  const boundAction = saveVehicleBudgetPolicyAction.bind(null, vehicleId);
  const [state, formAction] = useFormState(boundAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error && <p className="text-sm text-status-danger">{state.error}</p>}
      {state.success && <p className="text-sm text-status-success">{state.success}</p>}

      <div>
        <label className="mb-1 block text-xs text-slate-500">Tahun Anggaran</label>
        <select name="fiscal_year_id" defaultValue={currentFiscalYearId ?? ""} className={inputClass} required>
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
        <label className="mb-1 block text-xs text-slate-500">Jatah BBM per Bulan (Rp)</label>
        <input
          name="monthly_fuel_allocation"
          type="number"
          min="0"
          defaultValue={currentMonthlyFuel ?? ""}
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-500">Alokasi Pemeliharaan per Tahun (Rp)</label>
        <input
          name="annual_maintenance_allocation"
          type="number"
          min="0"
          defaultValue={currentAnnualMaintenance ?? ""}
          className={inputClass}
          required
        />
      </div>
      <SubmitButton />
    </form>
  );
}
