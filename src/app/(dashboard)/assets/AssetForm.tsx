"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { saveAssetAction, type AssetActionState } from "./actions";
import { ASSET_CONDITIONS } from "@/constants/asset";
import type { AssetCategoryOption, AssetTypeOption, UnitOption } from "@/repositories/masterDataRepository";

const initialState: AssetActionState = { error: null };

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

export type AssetFormInitialValues = {
  id?: string;
  asset_code?: string;
  register_number?: string;
  name?: string;
  category_id?: string;
  type_id?: string | null;
  brand?: string | null;
  model?: string | null;
  size_spec?: string | null;
  material?: string | null;
  acquisition_year?: number | null;
  condition?: string;
  quantity?: number;
  unit_of_measure?: string | null;
  acquisition_value?: number | null;
  book_value?: number | null;
  location?: string | null;
  holder_name?: string | null;
  unit_id?: string;
  notes?: string | null;
};

export function AssetForm({
  categories,
  types,
  units,
  initialValues,
}: {
  categories: AssetCategoryOption[];
  types: AssetTypeOption[];
  units: UnitOption[];
  initialValues?: AssetFormInitialValues;
}) {
  const [state, formAction] = useFormState(saveAssetAction, initialState);
  const [selectedCategory, setSelectedCategory] = useState(initialValues?.category_id ?? "");

  const filteredTypes = useMemo(
    () => types.filter((t) => t.category_id === selectedCategory),
    [types, selectedCategory]
  );

  const isEdit = Boolean(initialValues?.id);

  return (
    <form action={formAction} className="space-y-6">
      {initialValues?.id && <input type="hidden" name="id" value={initialValues.id} />}

      {state.error && (
        <div className="rounded-md border border-status-danger/30 bg-status-dangerBg px-4 py-3 text-sm text-status-danger">
          {state.error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Kode Barang" htmlFor="asset_code" required>
          <input
            id="asset_code"
            name="asset_code"
            defaultValue={initialValues?.asset_code}
            className={inputClass}
            placeholder="Contoh: 02.05.01.001"
          />
        </Field>
        <Field label="Nomor Register" htmlFor="register_number" required>
          <input
            id="register_number"
            name="register_number"
            defaultValue={initialValues?.register_number}
            className={inputClass}
          />
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

        <Field label="Nama Barang" htmlFor="name" required>
          <input
            id="name"
            name="name"
            defaultValue={initialValues?.name}
            className={inputClass}
            placeholder="Contoh: Kursi Kerja Staf"
          />
        </Field>
        <Field label="Kategori" htmlFor="category_id" required>
          <select
            id="category_id"
            name="category_id"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Pilih kategori
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Jenis Barang" htmlFor="type_id">
          <select
            id="type_id"
            name="type_id"
            defaultValue={initialValues?.type_id ?? ""}
            disabled={!selectedCategory}
            className={inputClass}
          >
            <option value="">
              {selectedCategory ? "Pilih jenis barang (opsional)" : "Pilih kategori dahulu"}
            </option>
            {filteredTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Merk" htmlFor="brand">
          <input id="brand" name="brand" defaultValue={initialValues?.brand ?? ""} className={inputClass} />
        </Field>
        <Field label="Tipe" htmlFor="model">
          <input id="model" name="model" defaultValue={initialValues?.model ?? ""} className={inputClass} />
        </Field>
        <Field label="Ukuran" htmlFor="size_spec">
          <input
            id="size_spec"
            name="size_spec"
            defaultValue={initialValues?.size_spec ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Bahan" htmlFor="material">
          <input
            id="material"
            name="material"
            defaultValue={initialValues?.material ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Tahun Perolehan" htmlFor="acquisition_year">
          <input
            id="acquisition_year"
            name="acquisition_year"
            type="number"
            defaultValue={initialValues?.acquisition_year ?? ""}
            className={inputClass}
            placeholder="2026"
          />
        </Field>
        <Field label="Kondisi" htmlFor="condition" required>
          <select
            id="condition"
            name="condition"
            defaultValue={initialValues?.condition ?? "BAIK"}
            className={inputClass}
          >
            {ASSET_CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Jumlah" htmlFor="quantity" required>
          <input
            id="quantity"
            name="quantity"
            type="number"
            step="0.01"
            defaultValue={initialValues?.quantity ?? 1}
            className={inputClass}
          />
        </Field>
        <Field label="Satuan" htmlFor="unit_of_measure">
          <input
            id="unit_of_measure"
            name="unit_of_measure"
            defaultValue={initialValues?.unit_of_measure ?? ""}
            className={inputClass}
            placeholder="Unit / Buah / Set"
          />
        </Field>
        <div />

        <Field label="Nilai Perolehan (Rp)" htmlFor="acquisition_value">
          <input
            id="acquisition_value"
            name="acquisition_value"
            type="number"
            defaultValue={initialValues?.acquisition_value ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Nilai Buku (Rp)" htmlFor="book_value">
          <input
            id="book_value"
            name="book_value"
            type="number"
            defaultValue={initialValues?.book_value ?? ""}
            className={inputClass}
          />
        </Field>
        <div />

        <Field label="Lokasi" htmlFor="location">
          <input
            id="location"
            name="location"
            defaultValue={initialValues?.location ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Pengguna / Pemegang Barang" htmlFor="holder_name">
          <input
            id="holder_name"
            name="holder_name"
            defaultValue={initialValues?.holder_name ?? ""}
            className={inputClass}
          />
        </Field>
      </section>

      <Field label="Keterangan" htmlFor="notes">
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={initialValues?.notes ?? ""}
          className={inputClass}
        />
      </Field>

      <div className="flex items-center gap-3 border-t border-surface-border pt-4">
        <SubmitButton label={isEdit ? "Simpan Perubahan" : "Simpan Aset"} />
      </div>
    </form>
  );
}
