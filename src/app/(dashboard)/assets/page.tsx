import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listAssets } from "@/repositories/assetRepository";
import { getAssetCategories, getUnits } from "@/repositories/masterDataRepository";
import { AssetFilters } from "./AssetFilters";
import { Pagination } from "@/components/ui/Pagination";
import { CONDITION_BADGE_CLASS, conditionLabel, type AssetCondition } from "@/constants/asset";
import { formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; unit?: string; condition?: string; page?: string };
}) {
  const supabase = createClient();

  const [categories, units, result] = await Promise.all([
    getAssetCategories(supabase),
    getUnits(supabase),
    listAssets(supabase, {
      search: searchParams.search,
      categoryId: searchParams.category,
      unitId: searchParams.unit,
      condition: searchParams.condition,
      page: searchParams.page ? Number(searchParams.page) : 1,
    }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Master BMD</h1>
          <p className="text-sm text-slate-500">
            Data induk Barang Milik Daerah berdasarkan Kartu Inventaris Barang (KIB B).
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/assets/categories"
            className="rounded-md border border-surface-border px-4 py-2 text-sm text-slate-600 hover:bg-surface-muted"
          >
            Kelola Kategori
          </Link>
          <Link
            href="/assets/new"
            className="flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Tambah Aset
          </Link>
        </div>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
        <AssetFilters
          categories={categories}
          units={units}
          defaultValues={{
            search: searchParams.search,
            categoryId: searchParams.category,
            unitId: searchParams.unit,
            condition: searchParams.condition,
          }}
        />
      </div>

      <div className="overflow-hidden rounded-card border border-surface-border bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">Kode / Register</th>
                <th className="whitespace-nowrap px-4 py-3">Nama Barang</th>
                <th className="whitespace-nowrap px-4 py-3">Kategori</th>
                <th className="whitespace-nowrap px-4 py-3">Unit Kerja</th>
                <th className="whitespace-nowrap px-4 py-3">Kondisi</th>
                <th className="whitespace-nowrap px-4 py-3 text-right">Jumlah</th>
                <th className="whitespace-nowrap px-4 py-3 text-right">Nilai Perolehan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {result.rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                    Belum ada data aset yang cocok dengan filter saat ini.
                  </td>
                </tr>
              )}
              {result.rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-muted/60">
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link href={`/assets/${row.id}`} className="font-medium text-brand-700 hover:underline">
                      {row.asset_code}
                    </Link>
                    <p className="text-xs text-slate-400">{row.register_number}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">{row.name}</p>
                    {(row.brand || row.model) && (
                      <p className="text-xs text-slate-400">
                        {[row.brand, row.model].filter(Boolean).join(" — ")}
                      </p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {row.asset_categories?.name ?? "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.units?.name ?? "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        CONDITION_BADGE_CLASS[row.condition as AssetCondition]
                      )}
                    >
                      {conditionLabel(row.condition)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">
                    {formatNumber(row.quantity)} {row.unit_of_measure ?? ""}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">
                    {formatCurrency(row.acquisition_value)}
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
          basePath="/assets"
          searchParams={searchParams}
        />
      </div>
    </div>
  );
}
