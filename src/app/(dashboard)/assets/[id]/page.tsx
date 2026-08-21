import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAssetById } from "@/repositories/assetRepository";
import {
  getTotalMaintenanceCostForAsset,
  getMaintenanceHistoryForAsset,
} from "@/repositories/maintenanceRepository";
import { softDeleteAssetAction } from "../actions";
import { CONDITION_BADGE_CLASS, conditionLabel, type AssetCondition } from "@/constants/asset";
import { STATUS_BADGE_CLASS, STATUS_LABELS, type TransactionStatus } from "@/constants/maintenance";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-surface-border py-2.5 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-700">{value ?? "-"}</span>
    </div>
  );
}

export default async function AssetDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [asset, totalMaintenanceCost, maintenanceHistory] = await Promise.all([
    getAssetById(supabase, params.id),
    getTotalMaintenanceCostForAsset(supabase, params.id),
    getMaintenanceHistoryForAsset(supabase, params.id),
  ]);

  if (!asset) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs text-slate-400">{asset.asset_code} — {asset.register_number}</p>
          <h1 className="text-lg font-semibold text-slate-800">{asset.name}</h1>
          <span
            className={cn(
              "mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium",
              CONDITION_BADGE_CLASS[asset.condition as AssetCondition]
            )}
          >
            {conditionLabel(asset.condition)}
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/assets/${asset.id}/edit`}
            className="flex items-center gap-2 rounded-md border border-surface-border px-4 py-2 text-sm text-slate-600 hover:bg-surface-muted"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <form action={softDeleteAssetAction.bind(null, asset.id)}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-md border border-status-danger/30 px-4 py-2 text-sm text-status-danger hover:bg-status-dangerBg"
            >
              <Trash2 className="h-4 w-4" />
              Nonaktifkan
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-card border border-surface-border bg-white p-5 shadow-card lg:col-span-2">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Informasi Barang</h2>
          <DetailRow label="Kategori" value={asset.asset_categories?.name} />
          <DetailRow label="Jenis Barang" value={asset.asset_types?.name} />
          <DetailRow label="Merk / Tipe" value={[asset.brand, asset.model].filter(Boolean).join(" / ") || "-"} />
          <DetailRow label="Ukuran / Bahan" value={[asset.size_spec, asset.material].filter(Boolean).join(" / ") || "-"} />
          <DetailRow label="Tahun Perolehan" value={asset.acquisition_year} />
          <DetailRow label="Jumlah" value={`${formatNumber(asset.quantity)} ${asset.unit_of_measure ?? ""}`} />
          <DetailRow label="Nilai Perolehan" value={formatCurrency(asset.acquisition_value)} />
          <DetailRow label="Nilai Buku" value={formatCurrency(asset.book_value)} />
          <DetailRow label="Lokasi" value={asset.location} />
          <DetailRow label="Pengguna / Pemegang Barang" value={asset.holder_name} />
          <DetailRow label="Unit Kerja" value={asset.units?.name} />
          <DetailRow label="Keterangan" value={asset.notes} />
        </div>

        <div className="space-y-4">
          <div className="rounded-card border border-surface-border bg-white p-5 shadow-card">
            <h2 className="mb-1 text-sm font-semibold text-slate-700">Total Biaya Pemeliharaan</h2>
            <p className="text-2xl font-semibold text-slate-800">{formatCurrency(totalMaintenanceCost)}</p>
            <p className="mt-1 text-xs text-slate-400">
              Dihitung otomatis dari transaksi berstatus Disetujui/Diposting (§55: setiap angka
              wajib bersumber dari transaksi database, bukan nilai tetap).
            </p>
          </div>

          <div className="rounded-card border border-surface-border bg-white shadow-card">
            <h2 className="border-b border-surface-border px-5 py-3 text-sm font-semibold text-slate-700">
              Riwayat Pemeliharaan
            </h2>
            {maintenanceHistory.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-slate-400">
                Belum ada transaksi pemeliharaan untuk aset ini.
              </p>
            ) : (
              <ul className="divide-y divide-surface-border">
                {maintenanceHistory.map((h) => (
                  <li key={h.id} className="px-5 py-3">
                    <Link href={`/maintenance/${h.id}`} className="block hover:bg-surface-muted/60">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-brand-700">{h.transaction_number}</p>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-medium",
                            STATUS_BADGE_CLASS[h.status as TransactionStatus]
                          )}
                        >
                          {STATUS_LABELS[h.status as TransactionStatus]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{h.maintenance_types?.name ?? "-"}</p>
                      <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                        <span>{formatDate(h.transaction_date)}</span>
                        <span className="font-medium text-slate-600">{formatCurrency(h.amount)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
