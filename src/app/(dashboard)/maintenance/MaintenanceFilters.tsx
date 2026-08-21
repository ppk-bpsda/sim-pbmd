import Link from "next/link";
import type { SimpleOption, FiscalYearOption, UnitOption } from "@/repositories/masterDataRepository";
import { TRANSACTION_STATUSES, STATUS_LABELS } from "@/constants/maintenance";

export function MaintenanceFilters({
  units,
  fiscalYears,
  maintenanceTypes,
  defaultValues,
}: {
  units: UnitOption[];
  fiscalYears: FiscalYearOption[];
  maintenanceTypes: SimpleOption[];
  defaultValues: {
    search?: string;
    status?: string;
    unitId?: string;
    fiscalYearId?: string;
    maintenanceTypeId?: string;
  };
}) {
  return (
    <form method="get" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <input
        type="search"
        name="search"
        placeholder="Cari no. transaksi, no. bukti, uraian..."
        defaultValue={defaultValues.search}
        className="rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none lg:col-span-2"
      />
      <select
        name="status"
        defaultValue={defaultValues.status ?? ""}
        className="rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      >
        <option value="">Semua Status</option>
        {TRANSACTION_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
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
      <select
        name="fiscal_year"
        defaultValue={defaultValues.fiscalYearId ?? ""}
        className="rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      >
        <option value="">Semua Tahun Anggaran</option>
        {fiscalYears.map((f) => (
          <option key={f.id} value={f.id}>
            {f.year}
          </option>
        ))}
      </select>
      <select
        name="type"
        defaultValue={defaultValues.maintenanceTypeId ?? ""}
        className="rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      >
        <option value="">Semua Jenis Pemeliharaan</option>
        {maintenanceTypes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-6">
        <button
          type="submit"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Terapkan Filter
        </button>
        <Link
          href="/maintenance"
          className="rounded-md border border-surface-border px-4 py-2 text-sm text-slate-600 hover:bg-surface-muted"
        >
          Reset Filter
        </Link>
      </div>
    </form>
  );
}
