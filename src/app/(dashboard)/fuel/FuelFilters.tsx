import Link from "next/link";
import type { UnitOption } from "@/repositories/masterDataRepository";

export function FuelFilters({
  units,
  defaultValues,
}: {
  units: UnitOption[];
  defaultValues: { unitId?: string; dateFrom?: string; dateTo?: string };
}) {
  return (
    <form method="get" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <select name="unit" defaultValue={defaultValues.unitId ?? ""} className="rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
        <option value="">Semua Unit Kerja</option>
        {units.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
      <div>
        <input type="date" name="date_from" defaultValue={defaultValues.dateFrom} className="w-full rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
      </div>
      <div>
        <input type="date" name="date_to" defaultValue={defaultValues.dateTo} className="w-full rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
      </div>

      <div className="flex items-center gap-2">
        <button type="submit" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Terapkan
        </button>
        <Link href="/fuel" className="rounded-md border border-surface-border px-4 py-2 text-sm text-slate-600 hover:bg-surface-muted">
          Reset
        </Link>
      </div>
    </form>
  );
}
