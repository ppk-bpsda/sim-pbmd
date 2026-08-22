import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getVehicleBudgetSummary } from "@/repositories/vehicleRepository";
import { getFiscalYears, getVehicleCategories, getUnits } from "@/repositories/masterDataRepository";
import { RekapFilters } from "./RekapFilters";
import { Pagination } from "@/components/ui/Pagination";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function VehicleRekapPage({
  searchParams,
}: {
  searchParams: { fiscal_year?: string; category?: string; unit?: string; search?: string; page?: string };
}) {
  const supabase = createClient();
  const fiscalYears = await getFiscalYears(supabase);
  const activeFiscalYear = fiscalYears.find((f) => f.is_active) ?? fiscalYears[0];
  const fiscalYearId = searchParams.fiscal_year ?? activeFiscalYear?.id ?? "";

  const [categories, units, result] = await Promise.all([
    getVehicleCategories(supabase),
    getUnits(supabase),
    fiscalYearId
      ? getVehicleBudgetSummary(supabase, {
          fiscalYearId,
          categoryId: searchParams.category,
          unitId: searchParams.unit,
          search: searchParams.search,
          page: searchParams.page ? Number(searchParams.page) : 1,
        })
      : Promise.resolve({ rows: [], total: 0, page: 1, pageSize: 20 }),
  ]);

  const totals = result.rows.reduce(
    (acc, r) => ({
      maintenance: acc.maintenance + r.maintenance_total,
      fuel: acc.fuel + r.fuel_total,
      realization: acc.realization + r.total_realization,
      budget: acc.budget + (r.annual_total_budget ?? 0),
    }),
    { maintenance: 0, fuel: 0, realization: 0, budget: 0 }
  );

  return (
    <div className="space-y-4">
      <div>
        <Link href="/vehicles" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Kendaraan
        </Link>
        <h1 className="text-lg font-semibold text-slate-800">Rekap Anggaran Kendaraan</h1>
        <p className="text-sm text-slate-500">
          Per kendaraan (Noka/Nosin/Nopol): jumlah transaksi pemeliharaan, jumlah pengisian BBM,
          dan realisasi anggaran terhadap pagu (§54-55 traceability).
        </p>
      </div>

      {fiscalYears.length === 0 ? (
        <div className="rounded-card border border-dashed border-surface-border bg-white p-8 text-center text-sm text-slate-400 shadow-card">
          Belum ada Tahun Anggaran. Tambahkan lewat Master Tahun Anggaran terlebih dahulu.
        </div>
      ) : (
        <>
          <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
            <RekapFilters
              fiscalYears={fiscalYears}
              categories={categories}
              units={units}
              defaultValues={{
                fiscalYearId,
                categoryId: searchParams.category,
                unitId: searchParams.unit,
                search: searchParams.search,
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
              <p className="text-xs text-slate-500">Total Pemeliharaan</p>
              <p className="text-lg font-semibold text-slate-800">{formatCurrency(totals.maintenance)}</p>
            </div>
            <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
              <p className="text-xs text-slate-500">Total BBM</p>
              <p className="text-lg font-semibold text-slate-800">{formatCurrency(totals.fuel)}</p>
            </div>
            <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
              <p className="text-xs text-slate-500">Total Realisasi</p>
              <p className="text-lg font-semibold text-slate-800">{formatCurrency(totals.realization)}</p>
            </div>
            <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
              <p className="text-xs text-slate-500">Total Pagu</p>
              <p className="text-lg font-semibold text-slate-800">{formatCurrency(totals.budget)}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-card border border-surface-border bg-white shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3">Nopol</th>
                    <th className="whitespace-nowrap px-4 py-3">Noka / Nosin</th>
                    <th className="whitespace-nowrap px-4 py-3">Kategori</th>
                    <th className="whitespace-nowrap px-4 py-3 text-center">Jml Pemeliharaan</th>
                    <th className="whitespace-nowrap px-4 py-3 text-center">Jml BBM</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">Realisasi</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">Pagu</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">Sisa</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">% Realisasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {result.rows.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-400">
                        Tidak ada data kendaraan untuk filter saat ini.
                      </td>
                    </tr>
                  )}
                  {result.rows.map((row) => (
                    <tr key={row.vehicle_id} className="hover:bg-surface-muted/60">
                      <td className="whitespace-nowrap px-4 py-3">
                        <Link href={`/vehicles/${row.vehicle_id}`} className="font-medium text-brand-700 hover:underline">
                          {row.plate_number}
                        </Link>
                        <p className="text-xs text-slate-400">{row.vehicle_name}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                        <p>Noka: {row.chassis_number ?? "-"}</p>
                        <p>Nosin: {row.engine_number ?? "-"}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.vehicle_category_name ?? "-"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-slate-600">{row.maintenance_count}x</td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-slate-600">{row.fuel_count}x</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-700">{formatCurrency(row.total_realization)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">
                        {row.annual_total_budget !== null ? formatCurrency(row.annual_total_budget) : "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">
                        {row.remaining_budget !== null ? formatCurrency(row.remaining_budget) : "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        {row.realization_percentage !== null ? (
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
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination page={result.page} pageSize={result.pageSize} total={result.total} basePath="/vehicles/rekap" searchParams={{ ...searchParams, fiscal_year: fiscalYearId }} />
          </div>
        </>
      )}
    </div>
  );
}
