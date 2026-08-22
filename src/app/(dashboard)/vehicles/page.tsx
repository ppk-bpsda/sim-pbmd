import Link from "next/link";
import { Plus, FileBarChart, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listVehicles } from "@/repositories/vehicleRepository";
import { getVehicleCategories } from "@/repositories/masterDataRepository";
import { getUnits } from "@/repositories/masterDataRepository";
import { VehicleFilters } from "./VehicleFilters";
import { Pagination } from "@/components/ui/Pagination";
import { VEHICLE_STATUS_BADGE_CLASS, vehicleStatusLabel, type VehicleStatus } from "@/constants/vehicle";
import { cn } from "@/lib/utils";

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; status?: string; unit?: string; page?: string };
}) {
  const supabase = createClient();

  const [categories, units, result] = await Promise.all([
    getVehicleCategories(supabase),
    getUnits(supabase),
    listVehicles(supabase, {
      search: searchParams.search,
      categoryId: searchParams.category,
      status: searchParams.status,
      unitId: searchParams.unit,
      page: searchParams.page ? Number(searchParams.page) : 1,
    }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Kendaraan</h1>
          <p className="text-sm text-slate-500">
            Data kendaraan dinas beserta Noka/Nosin/Nopol, dokumen, pemeliharaan, dan BBM.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/vehicles/rekap"
            className="flex items-center gap-2 rounded-md border border-surface-border px-4 py-2 text-sm text-slate-600 hover:bg-surface-muted"
          >
            <FileBarChart className="h-4 w-4" />
            Rekap Anggaran
          </Link>
          <Link
            href="/vehicles/policies"
            className="flex items-center gap-2 rounded-md border border-surface-border px-4 py-2 text-sm text-slate-600 hover:bg-surface-muted"
          >
            <Settings className="h-4 w-4" />
            Kelola Alokasi
          </Link>
          <Link
            href="/vehicles/new"
            className="flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Tambah Kendaraan
          </Link>
        </div>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
        <VehicleFilters
          categories={categories}
          units={units}
          defaultValues={{
            search: searchParams.search,
            categoryId: searchParams.category,
            status: searchParams.status,
            unitId: searchParams.unit,
          }}
        />
      </div>

      <div className="overflow-hidden rounded-card border border-surface-border bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">Nopol</th>
                <th className="whitespace-nowrap px-4 py-3">Noka / Nosin</th>
                <th className="whitespace-nowrap px-4 py-3">Nama Kendaraan</th>
                <th className="whitespace-nowrap px-4 py-3">Kategori</th>
                <th className="whitespace-nowrap px-4 py-3">Unit Kerja</th>
                <th className="whitespace-nowrap px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {result.rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                    Belum ada data kendaraan yang cocok dengan filter saat ini.
                  </td>
                </tr>
              )}
              {result.rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-muted/60">
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link href={`/vehicles/${row.id}`} className="font-medium text-brand-700 hover:underline">
                      {row.plate_number}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                    <p>Noka: {row.chassis_number ?? "-"}</p>
                    <p>Nosin: {row.engine_number ?? "-"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">{row.assets?.name ?? "-"}</p>
                    {(row.assets?.brand || row.assets?.model) && (
                      <p className="text-xs text-slate-400">
                        {[row.assets?.brand, row.assets?.model].filter(Boolean).join(" — ")}
                      </p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.vehicle_categories?.name ?? "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.assets?.units?.name ?? "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        VEHICLE_STATUS_BADGE_CLASS[row.status as VehicleStatus]
                      )}
                    >
                      {vehicleStatusLabel(row.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={result.page} pageSize={result.pageSize} total={result.total} basePath="/vehicles" searchParams={searchParams} />
      </div>
    </div>
  );
}
