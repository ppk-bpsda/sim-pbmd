import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listFuelTransactions } from "@/repositories/fuelRepository";
import { getUnits } from "@/repositories/masterDataRepository";
import { FuelFilters } from "./FuelFilters";
import { Pagination } from "@/components/ui/Pagination";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

export default async function FuelPage({
  searchParams,
}: {
  searchParams: { unit?: string; date_from?: string; date_to?: string; page?: string };
}) {
  const supabase = createClient();

  const [units, result] = await Promise.all([
    getUnits(supabase),
    listFuelTransactions(supabase, {
      unitId: searchParams.unit,
      dateFrom: searchParams.date_from,
      dateTo: searchParams.date_to,
      page: searchParams.page ? Number(searchParams.page) : 1,
    }),
  ]);

  const totalLiters = result.rows.reduce((sum, r) => sum + Number(r.volume_liters), 0);
  const totalCost = result.rows.reduce((sum, r) => sum + Number(r.total_cost), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">BBM</h1>
          <p className="text-sm text-slate-500">Pencatatan konsumsi bahan bakar kendaraan dinas.</p>
        </div>
        <Link
          href="/fuel/new"
          className="flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Catat BBM
        </Link>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
        <FuelFilters units={units} defaultValues={{ unitId: searchParams.unit, dateFrom: searchParams.date_from, dateTo: searchParams.date_to }} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
          <p className="text-xs text-slate-500">Total Volume (halaman ini)</p>
          <p className="text-lg font-semibold text-slate-800">{formatNumber(totalLiters)} L</p>
        </div>
        <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
          <p className="text-xs text-slate-500">Total Biaya (halaman ini)</p>
          <p className="text-lg font-semibold text-slate-800">{formatCurrency(totalCost)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-surface-border bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">Tanggal</th>
                <th className="whitespace-nowrap px-4 py-3">Kendaraan</th>
                <th className="whitespace-nowrap px-4 py-3">Jenis BBM</th>
                <th className="whitespace-nowrap px-4 py-3 text-right">Volume</th>
                <th className="whitespace-nowrap px-4 py-3 text-right">Harga/Liter</th>
                <th className="whitespace-nowrap px-4 py-3 text-right">Total</th>
                <th className="whitespace-nowrap px-4 py-3">SPBU/Penyedia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {result.rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                    Belum ada transaksi BBM yang cocok dengan filter saat ini.
                  </td>
                </tr>
              )}
              {result.rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-muted/60">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(row.transaction_date)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link href={`/fuel/${row.id}/edit`} className="font-medium text-brand-700 hover:underline">
                      {row.vehicles?.plate_number}
                    </Link>
                    <p className="text-xs text-slate-400">{row.vehicles?.assets?.name}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.fuel_type}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">{formatNumber(row.volume_liters)} L</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">{formatCurrency(row.price_per_liter)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-700">{formatCurrency(row.total_cost)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.provider_name ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={result.page} pageSize={result.pageSize} total={result.total} basePath="/fuel" searchParams={searchParams} />
      </div>
    </div>
  );
}
