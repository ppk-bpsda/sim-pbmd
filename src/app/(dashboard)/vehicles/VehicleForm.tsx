"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveVehicleAction, type VehicleActionState } from "./actions";
import { ASSET_CONDITIONS } from "@/constants/asset";
import { VEHICLE_STATUSES } from "@/constants/vehicle";
import type { SimpleOption, UnitOption } from "@/repositories/masterDataRepository";

const initialState: VehicleActionState = { error: null };

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

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
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

const inputClass =
  "w-full rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

export type VehicleFormInitialValues = {
  id?: string;
  asset_code?: string;
  register_number?: string;
  name?: string;
  brand?: string | null;
  model?: string | null;
  acquisition_year?: number | null;
  condition?: string;
  acquisition_value?: number | null;
  location?: string | null;
  holder_name?: string | null;
  unit_id?: string;
  notes?: string | null;
  vehicle_category_id?: string;
  plate_number?: string;
  chassis_number?: string | null;
  engine_number?: string | null;
  bpkb_number?: string | null;
  stnk_number?: string | null;
  color?: string | null;
  status?: string;
};

export function VehicleForm({
  categories,
  units,
  initialValues,
}: {
  categories: SimpleOption[];
  units: UnitOption[];
  initialValues?: VehicleFormInitialValues;
}) {
  const [state, formAction] = useFormState(saveVehicleAction, initialState);
  const isEdit = Boolean(initialValues?.id);

  return (
    <form action={formAction} className="space-y-6">
      {initialValues?.id && <input type="hidden" name="id" value={initialValues.id} />}

      {state.error && (
        <div className="rounded-md border border-status-danger/30 bg-status-dangerBg px-4 py-3 text-sm text-status-danger">
          {state.error}
        </div>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Data Kendaraan (Noka / Nosin / Nopol)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nomor Polisi (Nopol)" htmlFor="plate_number" required>
            <input
              id="plate_number"
              name="plate_number"
              defaultValue={initialValues?.plate_number}
              className={inputClass}
              placeholder="Contoh: B 1234 ABC"
            />
          </Field>
          <Field label="Nomor Rangka (Noka)" htmlFor="chassis_number">
            <input id="chassis_number" name="chassis_number" defaultValue={initialValues?.chassis_number ?? ""} className={inputClass} />
          </Field>
          <Field label="Nomor Mesin (Nosin)" htmlFor="engine_number">
            <input id="engine_number" name="engine_number" defaultValue={initialValues?.engine_number ?? ""} className={inputClass} />
          </Field>

          <Field label="Kategori Kendaraan" htmlFor="vehicle_category_id" required>
            <select id="vehicle_category_id" name="vehicle_category_id" defaultValue={initialValues?.vehicle_category_id ?? ""} className={inputClass}>
              <option value="" disabled>
                Pilih kategori kendaraan
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nomor BPKB" htmlFor="bpkb_number">
            <input id="bpkb_number" name="bpkb_number" defaultValue={initialValues?.bpkb_number ?? ""} className={inputClass} />
          </Field>
          <Field label="Nomor STNK" htmlFor="stnk_number">
            <input id="stnk_number" name="stnk_number" defaultValue={initialValues?.stnk_number ?? ""} className={inputClass} />
          </Field>

          <Field label="Warna" htmlFor="color">
            <input id="color" name="color" defaultValue={initialValues?.color ?? ""} className={inputClass} />
          </Field>
          <Field label="Status Kendaraan" htmlFor="status" required>
            <select id="status" name="status" defaultValue={initialValues?.status ?? "AKTIF"} className={inputClass}>
              {VEHICLE_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Data Aset (Kartu Inventaris Barang)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Kode Barang" htmlFor="asset_code" required>
            <input id="asset_code" name="asset_code" defaultValue={initialValues?.asset_code} className={inputClass} />
          </Field>
          <Field label="Nomor Register" htmlFor="register_number" required>
            <input id="register_number" name="register_number" defaultValue={initialValues?.register_number} className={inputClass} />
          </Field>
          <Field label="Unit Kerja" htmlFor="unit_id" required>
            <select id="unit_id" name="unit_id" defaultValue={initialValues?.unit_id ?? ""} className={inputClass}>
              <option value="" disabled>
                Pilih unit kerja
              </option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Nama Kendaraan" htmlFor="name" required>
            <input id="name" name="name" defaultValue={initialValues?.name} className={inputClass} placeholder="Contoh: Toyota Innova Dinas" />
          </Field>
          <Field label="Merk" htmlFor="brand">
            <input id="brand" name="brand" defaultValue={initialValues?.brand ?? ""} className={inputClass} />
          </Field>
          <Field label="Tipe" htmlFor="model">
            <input id="model" name="model" defaultValue={initialValues?.model ?? ""} className={inputClass} />
          </Field>

          <Field label="Tahun Perolehan" htmlFor="acquisition_year">
            <input id="acquisition_year" name="acquisition_year" type="number" defaultValue={initialValues?.acquisition_year ?? ""} className={inputClass} />
          </Field>
          <Field label="Kondisi" htmlFor="condition" required>
            <select id="condition" name="condition" defaultValue={initialValues?.condition ?? "BAIK"} className={inputClass}>
              {ASSET_CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nilai Perolehan (Rp)" htmlFor="acquisition_value">
            <input id="acquisition_value" name="acquisition_value" type="number" defaultValue={initialValues?.acquisition_value ?? ""} className={inputClass} />
          </Field>

          <Field label="Lokasi" htmlFor="location">
            <input id="location" name="location" defaultValue={initialValues?.location ?? ""} className={inputClass} />
          </Field>
          <Field label="Pengguna / Pemegang Kendaraan" htmlFor="holder_name">
            <input id="holder_name" name="holder_name" defaultValue={initialValues?.holder_name ?? ""} className={inputClass} />
          </Field>
        </div>
      </section>

      <Field label="Keterangan" htmlFor="notes">
        <textarea id="notes" name="notes" rows={3} defaultValue={initialValues?.notes ?? ""} className={inputClass} />
      </Field>

      <div className="flex items-center gap-3 border-t border-surface-border pt-4">
        <SubmitButton label={isEdit ? "Simpan Perubahan" : "Simpan Kendaraan"} />
      </div>
    </form>
  );
}
