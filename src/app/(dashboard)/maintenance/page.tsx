import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listMaintenanceTransactions, type MaintenanceListRow } from "@/repositories/maintenanceRepository";
import { getUnits, getFiscalYears, getMaintenanceTypes } from "@/repositories/masterDataRepository";
import { MaintenanceFilters } from "./MaintenanceFilters";
import { Pagination } from "@/components/ui/Pagination";
import { STATUS_BADGE_CLASS, STATUS_LABELS, type TransactionStatus } from "@/constants/maintenance";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    status?: string;
    unit?: string;
    fiscal_year?: string;
    type?: string;
    page?: string;
  };
}) {
  const supabase = createClient();

  const [units, fiscalYears, maintenanceTypes, result] = await Promise.all([
    getUnits(supabase),
    getFiscalYears(supabase),
    getMaintenanceTypes(supabase),
    listMaintenanceTransactions(supabase, {
      search: searchParams.search,
      status: searchParams.status,
      unitId: searchParams.unit,
      fiscalYearId: searchParams.fiscal_year,
      maintenanceTypeId: searchParams.type,
      page: searchParams.page ? Number(searchParams.page) : 1,
    }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Pemeliharaan</h1>
          <p className="text-sm text-slate-500">
            Transaksi pemeliharaan BMD dengan alur persetujuan (§23): Draf → Diajukan →
            Terverifikasi → Disetujui → Diposting.
          </p>
        </div>
        <Link
          href="/maintenance/new"
          className="flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Catat Transaksi
        </Link>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
        <MaintenanceFilters
          units={units}
          fiscalYears={fiscalYears}
          maintenanceTypes={maintenanceTypes}
          defaultValues={{
            search: searchParams.search,
            status: searchParams.status,
            unitId: searchParams.unit,
            fiscalYearId: searchParams.fiscal_year,
            maintenanceTypeId: searchParams.type,
          }}
        />
      </div>

      <div className="overflow-hidden rounded-card border border-surface-border bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">No. Transaksi</th>
                <th className="whitespace-nowrap px-4 py-3">Tanggal</th>
                <th className="whitespace-nowrap px-4 py-3">Aset</th>
                <th className="whitespace-nowrap px-4 py-3">Jenis Pemeliharaan</th>
                <th className="whitespace-nowrap px-4 py-3">Unit Kerja</th>
                <th className="whitespace-nowrap px-4 py-3 text-right">Nilai</th>
                <th className="whitespace-nowrap px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {result.rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                    Belum ada transaksi pemeliharaan yang cocok dengan filter saat ini.
                  </td>
                </tr>
              )}
              {result.rows.map((row: MaintenanceListRow) => (
                <tr key={row.id} className="hover:bg-surface-muted/60">
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link href={`/maintenance/${row.id}`} className="font-medium text-brand-700 hover:underline">
                      {row.transaction_number}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatDate(row.transaction_date)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">{row.assets?.name ?? "-"}</p>
                    <p className="text-xs text-slate-400">{row.assets?.asset_code}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {row.maintenance_types?.name ?? "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.units?.name ?? "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">
                    {formatCurrency(row.amount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        STATUS_BADGE_CLASS[row.status as TransactionStatus]
                      )}
                    >
                      {STATUS_LABELS[row.status as TransactionStatus]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          basePath="/maintenance"
          searchParams={searchParams}
        />
      </div>
    </div>
  );
}
