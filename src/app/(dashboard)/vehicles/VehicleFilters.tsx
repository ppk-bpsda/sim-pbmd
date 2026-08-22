import Link from "next/link";
import type { SimpleOption, UnitOption } from "@/repositories/masterDataRepository";
import { VEHICLE_STATUSES } from "@/constants/vehicle";

export function VehicleFilters({
  categories,
  units,
  defaultValues,
}: {
  categories: SimpleOption[];
  units: UnitOption[];
  defaultValues: { search?: string; categoryId?: string; status?: string; unitId?: string };
}) {
  return (
    <form method="get" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <input
        type="search"
        name="search"
        placeholder="Cari nopol, noka, nosin..."
        defaultValue={defaultValues.search}
        className="rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none lg:col-span-2"
      />
      <select
        name="category"
        defaultValue={defaultValues.categoryId ?? ""}
        className="rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      >
        <option value="">Semua Kategori</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        name="status"
        defaultValue={defaultValues.status ?? ""}
        className="rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      >
        <option value="">Semua Status</option>
        {VEHICLE_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <select
        name="unit"
        defaultValue={defaultValues.unitId ?? ""}
        className="rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      >
        <option value="">Semua Unit Kerja</option>
        {units.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-5">
        <button type="submit" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Terapkan Filter
        </button>
        <Link href="/vehicles" className="rounded-md border border-surface-border px-4 py-2 text-sm text-slate-600 hover:bg-surface-muted">
          Reset Filter
        </Link>
      </div>
    </form>
  );
}
