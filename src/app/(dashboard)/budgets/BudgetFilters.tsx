import Link from "next/link";
import type { FiscalYearOption, SimpleOption, UnitOption } from "@/repositories/masterDataRepository";

export function BudgetFilters({
  fiscalYears,
  units,
  budgetAccounts,
  defaultValues,
}: {
  fiscalYears: FiscalYearOption[];
  units: UnitOption[];
  budgetAccounts: SimpleOption[];
  defaultValues: { fiscalYearId?: string; unitId?: string; budgetAccountId?: string };
}) {
  return (
    <form method="get" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <select name="fiscal_year" defaultValue={defaultValues.fiscalYearId ?? ""} className="rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
        <option value="">Semua Tahun Anggaran</option>
        {fiscalYears.map((f) => (
          <option key={f.id} value={f.id}>
            {f.year}
          </option>
        ))}
      </select>
      <select name="unit" defaultValue={defaultValues.unitId ?? ""} className="rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
        <option value="">Semua Unit Kerja</option>
        {units.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
      <select name="account" defaultValue={defaultValues.budgetAccountId ?? ""} className="rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
        <option value="">Semua Rekening</option>
        {budgetAccounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.code} — {a.name}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <button type="submit" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Terapkan
        </button>
        <Link href="/budgets" className="rounded-md border border-surface-border px-4 py-2 text-sm text-slate-600 hover:bg-surface-muted">
          Reset
        </Link>
      </div>
    </form>
  );
}
