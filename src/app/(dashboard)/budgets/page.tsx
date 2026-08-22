import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listBudgetsWithRealization } from "@/repositories/budgetRepository";
import { getFiscalYears, getUnits, getBudgetAccounts } from "@/repositories/masterDataRepository";
import { BudgetFilters } from "./BudgetFilters";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: { fiscal_year?: string; unit?: string; account?: string };
}) {
  const supabase = createClient();

  const [fiscalYears, units, budgetAccounts] = await Promise.all([
    getFiscalYears(supabase),
    getUnits(supabase),
    getBudgetAccounts(supabase),
  ]);

  const activeFiscalYear = fiscalYears.find((f) => f.is_active) ?? fiscalYears[0];
  const fiscalYearId = searchParams.fiscal_year ?? activeFiscalYear?.id;

  const rows = await listBudgetsWithRealization(supabase, {
    fiscalYearId,
    unitId: searchParams.unit,
    budgetAccountId: searchParams.account,
  });

  const totals = rows.reduce(
    (acc, r) => ({
      pagu: acc.pagu + r.ceiling_amount,
      realisasi: acc.realisasi + r.realized_amount,
      sisa: acc.sisa + r.remaining_amount,
    }),
    { pagu: 0, realisasi: 0, sisa: 0 }
  );
  const totalPercentage = totals.pagu > 0 ? Math.round((totals.realisasi / totals.pagu) * 10000) / 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Anggaran</h1>
          <p className="text-sm text-slate-500">
            Pagu vs Realisasi pemeliharaan per rekening belanja. Realisasi dihitung otomatis dari
            transaksi berstatus Disetujui/Diposting (§11, §55) — klik nilai realisasi untuk melihat
            transaksi sumbernya.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/budgets/master"
            className="flex items-center gap-2 rounded-md border border-surface-border px-4 py-2 text-sm text-slate-600 hover:bg-surface-muted"
          >
            <Settings className="h-4 w-4" />
            Master Anggaran
          </Link>
          <Link
            href="/budgets/new"
            className="flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Tambah Pagu
          </Link>
        </div>
      </div>

      {fiscalYears.length === 0 ? (
        <div className="rounded-card border border-dashed border-surface-border bg-white p-8 text-center text-sm text-slate-400 shadow-card">
          Belum ada Tahun Anggaran. Tambahkan lewat Master Anggaran terlebih dahulu.
        </div>
      ) : (
        <>
          <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
            <BudgetFilters
              fiscalYears={fiscalYears}
              units={units}
              budgetAccounts={budgetAccounts}
              defaultValues={{ fiscalYearId, unitId: searchParams.unit, budgetAccountId: searchParams.account }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
              <p className="text-xs text-slate-500">Total Pagu</p>
              <p className="text-lg font-semibold text-slate-800">{formatCurrency(totals.pagu)}</p>
            </div>
            <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
              <p className="text-xs text-slate-500">Total Realisasi</p>
              <p className="text-lg font-semibold text-slate-800">{formatCurrency(totals.realisasi)}</p>
            </div>
            <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
              <p className="text-xs text-slate-500">Sisa Anggaran</p>
              <p className="text-lg font-semibold text-slate-800">{formatCurrency(totals.sisa)}</p>
            </div>
            <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
              <p className="text-xs text-slate-500">% Realisasi</p>
              <p className="text-lg font-semibold text-slate-800">{totalPercentage}%</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-card border border-surface-border bg-white shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3">Rekening Belanja</th>
                    <th className="whitespace-nowrap px-4 py-3">Unit Kerja</th>
                    <th className="whitespace-nowrap px-4 py-3">Tahun</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">Pagu</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">Realisasi</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">Sisa</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">%</th>
                    <th className="whitespace-nowrap px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                        Belum ada pagu anggaran untuk filter saat ini.
                      </td>
                    </tr>
                  )}
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-surface-muted/60">
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="font-medium text-slate-700">{row.budget_accounts?.code}</p>
                        <p className="text-xs text-slate-400">{row.budget_accounts?.name}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.units?.name ?? "-"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.fiscal_years?.year ?? "-"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">{formatCurrency(row.ceiling_amount)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <Link
                          href={`/maintenance?account=${row.budget_accounts?.id}&fiscal_year=${row.fiscal_years?.id}&unit=${row.units?.id}&status=APPROVED,POSTED`}
                          className="font-medium text-brand-700 hover:underline"
                          title="Lihat transaksi sumber realisasi ini"
                        >
                          {formatCurrency(row.realized_amount)}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">{formatCurrency(row.remaining_amount)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            row.realization_percentage >= 100
                              ? "bg-status-dangerBg text-status-danger"
                              : row.realization_percentage >= 80
                              ? "bg-status-warningBg text-status-warning"
                              : "bg-status-successBg text-status-success"
                          )}
                        >
                          {row.realization_percentage}%
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <Link href={`/budgets/${row.id}/edit`} className="text-xs text-slate-500 hover:text-brand-700 hover:underline">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
