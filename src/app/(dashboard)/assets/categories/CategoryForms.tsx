"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createCategoryAction, createTypeAction, type CategoryActionState } from "./actions";
import type { AssetCategoryOption } from "@/repositories/masterDataRepository";

const initialState: CategoryActionState = { error: null };
const inputClass =
  "w-full rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Menyimpan..." : label}
    </button>
  );
}

export function CategoryForm() {
  const [state, formAction] = useFormState(createCategoryAction, initialState);
  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input name="code" placeholder="Kode (mis. ELEKTRONIK)" className={inputClass} required />
        <input name="name" placeholder="Nama kategori" className={inputClass} required />
        <input name="description" placeholder="Deskripsi (opsional)" className={inputClass} />
      </div>
      {state.error && <p className="text-sm text-status-danger">{state.error}</p>}
      <SubmitButton label="Tambah Kategori" />
    </form>
  );
}

export function TypeForm({ categories }: { categories: AssetCategoryOption[] }) {
  const [state, formAction] = useFormState(createTypeAction, initialState);
  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select name="category_id" className={inputClass} required defaultValue="">
          <option value="" disabled>
            Pilih kategori induk
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input name="code" placeholder="Kode jenis barang" className={inputClass} required />
        <input name="name" placeholder="Nama jenis barang" className={inputClass} required />
      </div>
      {state.error && <p className="text-sm text-status-danger">{state.error}</p>}
      <SubmitButton label="Tambah Jenis Barang" />
    </form>
  );
}
