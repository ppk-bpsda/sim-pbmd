"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveFuelAction, type FuelActionState } from "./actions";
import { VehiclePicker } from "@/components/ui/VehiclePicker";

const initialState: FuelActionState = { error: null };
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

function Field({ label, htmlFor, required, children }: { label: string; htmlFor: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-status-danger"> *</span>}
      </label>
      {children}
    </div>
  );
}

export type FuelFormInitialValues = {
  id?: string;
  transaction_date?: string;
  vehicle?: { id: string; plate_number: string; name: string; unit_id: string; unitName?: string | null };
  fuel_type?: string;
  volume_liters?: number;
  price_per_liter?: number;
  odometer_km?: number | null;
  provider_name?: string | null;
  proof_number?: string | null;
  notes?: string | null;
};

export function FuelForm({ initialValues }: { initialValues?: FuelFormInitialValues }) {
  const [state, formAction] = useFormState(saveFuelAction, initialState);
  const isEdit = Boolean(initialValues?.id);

  return (
    <form action={formAction} className="space-y-6">
      {initialValues?.id && <input type="hidden" name="id" value={initialValues.id} />}

      {state.error && (
        <div className="rounded-md border border-status-danger/30 bg-status-dangerBg px-4 py-3 text-sm text-status-danger">
          {state.error}
        </div>
      )}

      <Field label="Kendaraan" htmlFor="vehicle_search" required>
        <VehiclePicker initialVehicle={initialValues?.vehicle} />
      </Field>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Tanggal" htmlFor="transaction_date" required>
          <input id="transaction_date" name="transaction_date" type="date" defaultValue={initialValues?.transaction_date} className={inputClass} />
        </Field>
        <Field label="Jenis BBM" htmlFor="fuel_type" required>
          <input id="fuel_type" name="fuel_type" defaultValue={initialValues?.fuel_type ?? ""} className={inputClass} placeholder="Pertalite / Pertamax / Solar" />
        </Field>
        <Field label="SPBU / Penyedia" htmlFor="provider_name">
          <input id="provider_name" name="provider_name" defaultValue={initialValues?.provider_name ?? ""} className={inputClass} />
        </Field>

        <Field label="Volume (Liter)" htmlFor="volume_liters" required>
          <input id="volume_liters" name="volume_liters" type="number" step="0.01" min="0" defaultValue={initialValues?.volume_liters ?? ""} className={inputClass} />
        </Field>
        <Field label="Harga per Liter (Rp)" htmlFor="price_per_liter" required>
          <input id="price_per_liter" name="price_per_liter" type="number" min="0" defaultValue={initialValues?.price_per_liter ?? ""} className={inputClass} />
        </Field>
        <Field label="Odometer (KM)" htmlFor="odometer_km">
          <input id="odometer_km" name="odometer_km" type="number" min="0" defaultValue={initialValues?.odometer_km ?? ""} className={inputClass} placeholder="Opsional" />
        </Field>

        <Field label="Nomor Bukti" htmlFor="proof_number">
          <input id="proof_number" name="proof_number" defaultValue={initialValues?.proof_number ?? ""} className={inputClass} />
        </Field>
      </section>

      <Field label="Keterangan" htmlFor="notes">
        <textarea id="notes" name="notes" rows={2} defaultValue={initialValues?.notes ?? ""} className={inputClass} />
      </Field>

      <div className="flex items-center gap-3 border-t border-surface-border pt-4">
        <SubmitButton label={isEdit ? "Simpan Perubahan" : "Simpan Transaksi BBM"} />
        <p className="text-xs text-slate-400">Total biaya dihitung otomatis (Volume × Harga per Liter).</p>
      </div>
    </form>
  );
}
